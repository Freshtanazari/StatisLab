import React, { useState } from "react";
import { apiUrl } from "../config/api";

const IMAGE_KEYS = ["saved_path", "plot_path", "image", "image_path"];
const HIDDEN_DETAIL_KEYS = new Set([
  ...IMAGE_KEYS,
  "plot_url",
  "sessionId",
  "file_path",
  "saved_file",
]);
const PLOT_METADATA_KEYS = new Set(["plot_name", "plot_columns"]);
const HIGHLIGHT_KEYS = [
  "test",
  "statistic",
  "p_value",
  "mean",
  "median",
  "std",
  "count",
  "n",
  "missing",
];
const COMPACT_LIMIT = 8;
const EXPANDED_LIMIT = 30;

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const toTitle = (key) =>
  String(key)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "-";
    }
    return value.map((entry) => String(entry)).join(", ");
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return String(value);
    }
    return Number.isInteger(value) ? value.toString() : value.toFixed(4);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
};

const getImageFileName = (result) => {
  if (!isPlainObject(result)) {
    return null;
  }
  const imagePathValue = IMAGE_KEYS.map((key) => result[key]).find(
    (value) => typeof value === "string" && /\.(png|jpg|jpeg|svg)$/i.test(value),
  );

  if (!imagePathValue) {
    return null;
  }
  return imagePathValue.split(/[\\/]/).pop();
};

const getImageUrl = (result) => {
  if (!isPlainObject(result)) {
    return null;
  }

  const plotUrl = result.plot_url;
  if (typeof plotUrl === "string" && plotUrl.startsWith("/")) {
    return apiUrl(plotUrl);
  }

  const imageFileName = getImageFileName(result);
  if (!imageFileName) {
    return null;
  }

  return apiUrl(`/plots/${imageFileName}`);
};

const getPValueStatus = (value) => {
  if (typeof value !== "number") {
    return null;
  }
  if (value < 0.05) {
    return {
      label: "Significant",
      chipClass: "bg-green-100 text-green-700 border-green-200",
      valueClass: "text-green-700",
    };
  }
  return {
    label: "Not Significant",
    chipClass: "bg-amber-100 text-amber-700 border-amber-200",
    valueClass: "text-amber-700",
  };
};

const ResultSection = ({ title, children }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
      {title}
    </p>
    {children}
  </div>
);

const ArrayRenderer = ({ data, title, compactMode, variant }) => {
  const arrayItemLimit = compactMode ? COMPACT_LIMIT : EXPANDED_LIMIT;
  const hasObjectRows = data.length > 0 && isPlainObject(data[0]);
  const tableClass = variant === "report" ? "min-w-full text-[11px]" : "min-w-full text-xs";

  if (hasObjectRows) {
    const columns = Object.keys(data[0]);
    return (
      <ResultSection title={title}>
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className={tableClass}>
            <thead className="bg-teal-700 text-white">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-2 py-2 text-left font-semibold border-b border-teal-800">
                    {toTitle(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, arrayItemLimit).map((row, rowIndex) => (
                <tr key={`${title}-${rowIndex}`} className="border-t border-gray-100">
                  {columns.map((column) => (
                    <td key={`${title}-${rowIndex}-${column}`} className="px-2 py-1.5 text-gray-700">
                      {formatValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length > arrayItemLimit && (
          <p className="text-[11px] text-gray-500 mt-2">
            Showing {arrayItemLimit} of {data.length} rows.
          </p>
        )}
      </ResultSection>
    );
  }

  return (
    <ResultSection title={title}>
      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
        {data.slice(0, arrayItemLimit).map((item, index) => (
          <li key={`${title}-${index}`}>{formatValue(item)}</li>
        ))}
      </ul>
      {data.length > arrayItemLimit && (
        <p className="text-[11px] text-gray-500 mt-2">
          Showing {arrayItemLimit} of {data.length} items.
        </p>
      )}
    </ResultSection>
  );
};

const ResultRenderer = ({ result, variant = "default" }) => {
  const [compactMode, setCompactMode] = useState(true);
  const isReportVariant = variant === "report";
  const wrapperClass = isReportVariant ? "space-y-3" : "space-y-4";

  if (Array.isArray(result)) {
    return (
      <div className={wrapperClass}>
        <ArrayRenderer
          data={result}
          title="Results"
          compactMode={compactMode}
          variant={variant}
        />
        {result.length > COMPACT_LIMIT && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCompactMode((prev) => !prev)}
              className="text-xs text-teal-700 hover:text-teal-800 underline"
            >
              {compactMode ? "Show full result" : "Use compact view"}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!isPlainObject(result)) {
    if (typeof result === "string") {
      return (
        <pre className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3 whitespace-pre-wrap break-words font-mono">
          {result}
        </pre>
      );
    }

    return (
      <div className="text-sm text-gray-700">{formatValue(result)}</div>
    );
  }

  const imageUrl = getImageUrl(result);
  const plotName = typeof result.plot_name === "string" ? result.plot_name : null;
  const primitiveEntries = Object.entries(result).filter(
    ([key, value]) =>
      !HIDDEN_DETAIL_KEYS.has(key) &&
      !PLOT_METADATA_KEYS.has(key) &&
      (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"),
  );
  const nestedObjectEntries = Object.entries(result).filter(
    ([key, value]) =>
      !HIDDEN_DETAIL_KEYS.has(key) &&
      !PLOT_METADATA_KEYS.has(key) &&
      isPlainObject(value),
  );
  const arrayEntries = Object.entries(result).filter(([key, value]) =>
    !HIDDEN_DETAIL_KEYS.has(key) &&
    !PLOT_METADATA_KEYS.has(key) &&
    Array.isArray(value),
  );

  const highlights = HIGHLIGHT_KEYS.filter((key) =>
    primitiveEntries.some(([entryKey]) => entryKey === key),
  ).map((key) => [key, result[key]]);

  const insightEntries = Object.entries(result).filter(
    ([key, value]) =>
      /insight|interpret|conclusion|recommend|note|message/i.test(key) &&
      (typeof value === "string" || Array.isArray(value)),
  );

  const highlightKeySet = new Set(highlights.map(([key]) => key));
  const insightKeySet = new Set(insightEntries.map(([key]) => key));
  const detailSourceEntries = primitiveEntries.filter(
    ([key]) => !highlightKeySet.has(key) && !insightKeySet.has(key),
  );

  const detailEntries = compactMode
    ? detailSourceEntries.slice(0, COMPACT_LIMIT)
    : detailSourceEntries;

  const nestedSections = nestedObjectEntries.map(([sectionKey, sectionValue]) => [
    sectionKey,
    compactMode
      ? Object.entries(sectionValue).slice(0, COMPACT_LIMIT)
      : Object.entries(sectionValue),
    Object.entries(sectionValue).length,
  ]);

  const hasNestedMatrix = nestedObjectEntries.length > 1;
  const nestedMatrixSchema = hasNestedMatrix
    ? Object.keys(nestedObjectEntries[0][1]).slice().sort().join("|")
    : "";
  const canRenderNestedMatrix =
    hasNestedMatrix &&
    nestedObjectEntries.every(([, sectionValue]) => {
      if (!isPlainObject(sectionValue)) return false;
      const keys = Object.keys(sectionValue).slice().sort().join("|");
      if (keys !== nestedMatrixSchema) return false;

      return Object.values(sectionValue).every(
        (value) =>
          value === null ||
          value === undefined ||
          Array.isArray(value) ||
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean",
      );
    });

  const nestedMatrixColumns = canRenderNestedMatrix
    ? nestedObjectEntries.map(([sectionKey]) => sectionKey)
    : [];

  const nestedMatrixMetrics = canRenderNestedMatrix
    ? Object.keys(nestedObjectEntries[0][1])
    : [];

  return (
    <div className={wrapperClass}>
      {(primitiveEntries.length > COMPACT_LIMIT ||
        nestedObjectEntries.some(([, value]) => Object.keys(value).length > COMPACT_LIMIT) ||
        arrayEntries.some(([, value]) => value.length > COMPACT_LIMIT)) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setCompactMode((prev) => !prev)}
            className="text-xs text-teal-700 hover:text-teal-800 underline"
          >
            {compactMode ? "Show full result" : "Use compact view"}
          </button>
        </div>
      )}

      {plotName && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-800">{toTitle(plotName)}</p>
        </div>
      )}

      {highlights.length > 0 && (
        <ResultSection title="Highlights">
          <div className={`grid gap-2 ${isReportVariant ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-2 md:grid-cols-3"}`}>
            {highlights.map(([key, value]) => {
              const pValueStatus = key === "p_value" ? getPValueStatus(value) : null;
              return (
                <div key={key} className="rounded border border-gray-200 bg-gray-50 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-gray-500">{toTitle(key)}</p>
                    {pValueStatus && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${pValueStatus.chipClass}`}
                      >
                        {pValueStatus.label}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      pValueStatus ? pValueStatus.valueClass : "text-gray-800"
                    }`}
                  >
                    {formatValue(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </ResultSection>
      )}

      {imageUrl && (
        <div className={`flex justify-center rounded border border-teal-100 bg-teal-50 ${isReportVariant ? "p-1.5" : "p-2"}`}>
          <img
            src={imageUrl}
            alt="Analysis Plot"
            className={`w-full rounded object-contain ${isReportVariant ? "max-w-sm" : "max-w-xs"}`}
            style={{ maxHeight: isReportVariant ? "240px" : "220px" }}
          />
        </div>
      )}

      {detailEntries.length > 0 && (
        <ResultSection title="Details">
          <div className={`grid gap-x-4 gap-y-2 ${isReportVariant ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
            {detailEntries.map(([key, value]) => (
              <div key={key} className="flex items-baseline justify-between gap-3 border-b border-gray-100 pb-1">
                <span className="text-sm text-gray-600">{toTitle(key)}</span>
                <span className="text-sm font-medium text-gray-800 text-right">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
          {compactMode && detailSourceEntries.length > COMPACT_LIMIT && (
            <p className="text-[11px] text-gray-500 mt-2">
              Showing {COMPACT_LIMIT} of {detailSourceEntries.length} detail fields.
            </p>
          )}
        </ResultSection>
      )}

      {canRenderNestedMatrix ? (
        <ResultSection title="Summary Statistics">
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className={isReportVariant ? "min-w-full text-[11px]" : "min-w-full text-xs"}>
              <thead className="bg-teal-700 text-white">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold border-b border-teal-800">Metric</th>
                  {nestedMatrixColumns.map((column) => (
                    <th key={column} className="px-2 py-2 text-left font-semibold border-b border-teal-800">
                      {toTitle(column)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(compactMode ? nestedMatrixMetrics.slice(0, COMPACT_LIMIT) : nestedMatrixMetrics).map((metric) => (
                  <tr key={metric} className="border-t border-gray-100">
                    <td className="px-2 py-1.5 text-gray-700 font-medium">{toTitle(metric)}</td>
                    {nestedObjectEntries.map(([column, sectionValue]) => (
                      <td key={`${metric}-${column}`} className="px-2 py-1.5 text-gray-700">
                        {formatValue(sectionValue[metric])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {compactMode && nestedMatrixMetrics.length > COMPACT_LIMIT && (
            <p className="text-[11px] text-gray-500 mt-2">
              Showing {COMPACT_LIMIT} of {nestedMatrixMetrics.length} metrics.
            </p>
          )}
        </ResultSection>
      ) : (
        nestedSections.map(([sectionKey, sectionEntries, totalCount]) => (
          <ResultSection key={sectionKey} title={toTitle(sectionKey)}>
            <div className={`grid gap-x-4 gap-y-2 ${isReportVariant ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
              {sectionEntries.map(([key, value]) => (
                <div key={`${sectionKey}-${key}`} className="flex items-baseline justify-between gap-3 border-b border-gray-100 pb-1">
                  <span className="text-sm text-gray-600">{toTitle(key)}</span>
                  <span className="text-sm font-medium text-gray-800 text-right">
                    {formatValue(value)}
                  </span>
                </div>
              ))}
            </div>
            {compactMode && totalCount > COMPACT_LIMIT && (
              <p className="text-[11px] text-gray-500 mt-2">
                Showing {COMPACT_LIMIT} of {totalCount} fields.
              </p>
            )}
          </ResultSection>
        ))
      )}

      {arrayEntries.length > 0 && (
        (() => {
          // Only combine object arrays when they share the same schema.
          const objectArrayEntries = arrayEntries.filter(
            ([, value]) => Array.isArray(value) && value.length > 0 && isPlainObject(value[0])
          );

          const hasMultipleObjectArrays = objectArrayEntries.length > 1;

          const getSchemaKey = (arr) =>
            Object.keys(arr[0])
              .slice()
              .sort()
              .join("|");

          const hasCompatibleSchemas = hasMultipleObjectArrays
            ? objectArrayEntries.every(([, value]) => getSchemaKey(value) === getSchemaKey(objectArrayEntries[0][1]))
            : false;

          if (hasMultipleObjectArrays && hasCompatibleSchemas) {
            // Combine multiple object arrays into one table
            const combinedData = [];
            const combinedTitle = "Results";
            
            objectArrayEntries.forEach(([arrayKey, arrayValue]) => {
              if (Array.isArray(arrayValue) && arrayValue.length > 0 && isPlainObject(arrayValue[0])) {
                arrayValue.forEach((row) => {
                  combinedData.push({
                    ...row,
                    _source: toTitle(arrayKey),
                  });
                });
              }
            });

            if (combinedData.length > 0) {
              const arrayItemLimit = compactMode ? COMPACT_LIMIT : EXPANDED_LIMIT;
              const columns = Object.keys(combinedData[0]).filter((col) => col !== "_source");
              
              return (
                <ResultSection key="combined-arrays" title={combinedTitle}>
                  <div className="overflow-x-auto rounded border border-gray-200">
                    <table className="min-w-full text-xs">
                      <thead className="bg-teal-700 text-white">
                        <tr>
                          <th className="px-2 py-2 text-left font-semibold border-b border-teal-800">
                            Column
                          </th>
                          {columns.map((column) => (
                            <th key={column} className="px-2 py-2 text-left font-semibold border-b border-teal-800">
                              {toTitle(column)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {combinedData.slice(0, arrayItemLimit).map((row, rowIndex) => (
                          <tr key={`combined-${rowIndex}`} className="border-t border-gray-100">
                            <td className="px-2 py-1.5 text-gray-700 font-medium">
                              {row._source}
                            </td>
                            {columns.map((column) => (
                              <td key={`combined-${rowIndex}-${column}`} className="px-2 py-1.5 text-gray-700">
                                {formatValue(row[column])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {combinedData.length > arrayItemLimit && (
                    <p className="text-[11px] text-gray-500 mt-2">
                      Showing {arrayItemLimit} of {combinedData.length} rows.
                    </p>
                  )}
                </ResultSection>
              );
            }
          }

          // Fallback: render as separate tables if not combined
          return arrayEntries.map(([key, value]) => (
            <ArrayRenderer
              key={key}
              data={value}
              title={toTitle(key)}
              compactMode={compactMode}
              variant={variant}
            />
          ));
        })()
      )}

      {insightEntries.length > 0 && (
        <ResultSection title="Insights">
          <div className="space-y-2">
            {insightEntries.map(([key, value]) => (
              <div key={key} className="rounded border-l-4 border-teal-300 bg-teal-50 p-2">
                <p className="text-[11px] uppercase tracking-wide text-teal-700 font-semibold mb-1">
                  {toTitle(key)}
                </p>
                {Array.isArray(value) ? (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {value.map((entry, index) => (
                      <li key={`${key}-${index}`}>{formatValue(entry)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-700">{formatValue(value)}</p>
                )}
              </div>
            ))}
          </div>
        </ResultSection>
      )}

    </div>
  );
};

export default ResultRenderer;
