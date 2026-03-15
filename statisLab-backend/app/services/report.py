from app.storage.DatasetStore import DatasetStore


def _is_full_report_entry(entry):
    return (
        isinstance(entry, dict)
        and "result" in entry
        and any(key in entry for key in ["action", "name", "section"])
    )


def _normalize_legacy_entries(entries, session_id):
    normalized_entries = []

    for index, entry in enumerate(entries):
        if _is_full_report_entry(entry):
            # Keep valid report objects while backfilling missing optional metadata.
            normalized_entries.append(
                {
                    "sessionId": entry.get("sessionId") or session_id,
                    "action": entry.get("action") or "legacy_analysis",
                    "name": entry.get("name") or f"Legacy Analysis #{index + 1}",
                    "section": entry.get("section") or "Legacy",
                    "params": entry.get("params") or {},
                    "parametersNames": entry.get("parametersNames") or [],
                    "result": entry.get("result"),
                }
            )
            continue

        # Wrap old raw result payloads in the new full report format.
        normalized_entries.append(
            {
                "sessionId": session_id,
                "action": "legacy_analysis",
                "name": f"Legacy Analysis #{index + 1}",
                "section": "Legacy",
                "params": {},
                "parametersNames": [],
                "result": entry,
            }
        )

    return normalized_entries


def get_report(sessionId: str, store: DatasetStore):
    dataset = store.getDataset(sessionId)
    report = dataset.report 
    if report is None:
        raise KeyError(f"Report not found for sessionId: {sessionId}")

    result = report.returnAllAnalysis()
    normalized_result = _normalize_legacy_entries(result, sessionId)

    # One-time in-memory migration: replace legacy entries after first read.
    if normalized_result != result:
        report.analyses = normalized_result

    return normalized_result


def delete_report_entry(sessionId: str, index: int, store: DatasetStore):
    dataset = store.getDataset(sessionId)
    report = dataset.report
    if report is None:
        raise KeyError(f"Report not found for sessionId: {sessionId}")

    analyses = report.returnAllAnalysis()
    normalized_result = _normalize_legacy_entries(analyses, sessionId)
    if normalized_result != analyses:
        report.analyses = normalized_result

    if not (0 <= index < len(report.analyses)):
        raise IndexError(f"Invalid report index: {index}")

    report.removeAnalysis(index)
    return report.returnAllAnalysis()


def reorder_report_entry(sessionId: str, from_index: int, to_index: int, store: DatasetStore):
    dataset = store.getDataset(sessionId)
    report = dataset.report
    if report is None:
        raise KeyError(f"Report not found for sessionId: {sessionId}")

    analyses = report.returnAllAnalysis()
    normalized_result = _normalize_legacy_entries(analyses, sessionId)
    if normalized_result != analyses:
        report.analyses = normalized_result

    size = len(report.analyses)
    if not (0 <= from_index < size):
        raise IndexError(f"Invalid source index: {from_index}")
    if not (0 <= to_index < size):
        raise IndexError(f"Invalid target index: {to_index}")
    if from_index == to_index:
        return report.returnAllAnalysis()

    moved_item = report.analyses.pop(from_index)
    report.analyses.insert(to_index, moved_item)
    return report.returnAllAnalysis()


def reset_report_entries(sessionId: str, store: DatasetStore):
    dataset = store.getDataset(sessionId)
    report = dataset.report
    if report is None:
        raise KeyError(f"Report not found for sessionId: {sessionId}")

    report.analyses = []
    return report.returnAllAnalysis()