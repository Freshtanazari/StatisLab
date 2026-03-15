import React, { useState } from "react";
import { apiUrl } from "../config/api";

const IMAGE_KEYS = ["saved_path", "plot_path", "image", "image_path"];
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

const ArrayRenderer = ({ data, title, compactMode }) => {
  const arrayItemLimit = compactMode ? COMPACT_LIMIT : EXPANDED_LIMIT;
  const hasObjectRows = data.length > 0 && isPlainObject(data[0]);

  if (hasObjectRows) {
    const columns = Object.keys(data[0]);
    return (
      <ResultSection title={title}>
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-2 py-2 text-left text-gray-600 font-semibold">
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

const ResultRenderer = ({ result }) => {
  const [showRaw, setShowRaw] = useState(false);
  const [compactMode, setCompactMode] = useState(true);

  if (Array.isArray(result)) {
    return (
      <div className="space-y-4">
        <ArrayRenderer data={result} title="Results" compactMode={compactMode} />
        {result.length > COMPACT_LIMIT && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCompactMode((prev) => !prev)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {compactMode ? "Show full result" : "Use compact view"}
            </button>
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={() => setShowRaw((prev) => !prev)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {showRaw ? "Hide raw JSON" : "Show raw JSON"}
          </button>
          {showRaw && (
            <pre className="mt-2 text-xs text-gray-800 bg-gray-50 p-2 overflow-x-auto rounded border border-gray-200">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
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
  const primitiveEntries = Object.entries(result).filter(
    ([key, value]) =>
      !IMAGE_KEYS.includes(key) &&
      (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"),
  );
  const nestedObjectEntries = Object.entries(result).filter(
    ([, value]) => isPlainObject(value),
  );
  const arrayEntries = Object.entries(result).filter(([, value]) =>
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

  const detailEntries = compactMode
    ? primitiveEntries.slice(0, COMPACT_LIMIT)
    : primitiveEntries;

  const nestedSections = nestedObjectEntries.map(([sectionKey, sectionValue]) => [
    sectionKey,
    compactMode
      ? Object.entries(sectionValue).slice(0, COMPACT_LIMIT)
      : Object.entries(sectionValue),
    Object.entries(sectionValue).length,
  ]);

  return (
    <div className="space-y-4">
      {(primitiveEntries.length > COMPACT_LIMIT ||
        nestedObjectEntries.some(([, value]) => Object.keys(value).length > COMPACT_LIMIT) ||
        arrayEntries.some(([, value]) => value.length > COMPACT_LIMIT)) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setCompactMode((prev) => !prev)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {compactMode ? "Show full result" : "Use compact view"}
          </button>
        </div>
      )}

      {highlights.length > 0 && (
        <ResultSection title="Highlights">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
        <div className="flex justify-center rounded border border-blue-100 bg-blue-50 p-2">
          <img
            src={imageUrl}
            alt="Analysis Plot"
            className="w-full sm:w-64 md:w-80 h-auto rounded"
          />
        </div>
      )}

      {primitiveEntries.length > 0 && (
        <ResultSection title="Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {detailEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between rounded border border-gray-100 p-2">
                <span className="text-sm text-gray-600">{toTitle(key)}</span>
                <span className="text-sm font-medium text-gray-800 text-right">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
          {compactMode && primitiveEntries.length > COMPACT_LIMIT && (
            <p className="text-[11px] text-gray-500 mt-2">
              Showing {COMPACT_LIMIT} of {primitiveEntries.length} detail fields.
            </p>
          )}
        </ResultSection>
      )}

      {nestedSections.map(([sectionKey, sectionEntries, totalCount]) => (
        <ResultSection key={sectionKey} title={toTitle(sectionKey)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sectionEntries.map(([key, value]) => (
              <div key={`${sectionKey}-${key}`} className="flex justify-between rounded border border-gray-100 p-2">
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
      ))}

      {arrayEntries.length > 0 && (
        (() => {
          // Check if we have multiple array entries with object rows
          const hasMultipleObjectArrays = arrayEntries.filter(
            ([, value]) => Array.isArray(value) && value.length > 0 && isPlainObject(value[0])
          ).length > 1;

          if (hasMultipleObjectArrays) {
            // Combine multiple object arrays into one table
            const combinedData = [];
            const combinedTitle = "Results";
            
            arrayEntries.forEach(([arrayKey, arrayValue]) => {
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
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-2 text-left text-gray-600 font-semibold">
                            Column
                          </th>
                          {columns.map((column) => (
                            <th key={column} className="px-2 py-2 text-left text-gray-600 font-semibold">
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
            />
          ));
        })()
      )}

      {insightEntries.length > 0 && (
        <ResultSection title="Insights">
          <div className="space-y-2">
            {insightEntries.map(([key, value]) => (
              <div key={key} className="rounded border-l-4 border-blue-300 bg-blue-50 p-2">
                <p className="text-[11px] uppercase tracking-wide text-blue-700 font-semibold mb-1">
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

      <div>
        <button
          type="button"
          onClick={() => setShowRaw((prev) => !prev)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {showRaw ? "Hide raw JSON" : "Show raw JSON"}
        </button>
        {showRaw && (
          <pre className="mt-2 text-xs text-gray-800 bg-gray-50 p-2 overflow-x-auto rounded border border-gray-200">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ResultRenderer;
