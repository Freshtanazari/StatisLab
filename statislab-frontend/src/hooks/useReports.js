import { useCallback, useEffect, useState } from "react";
import { getReports } from "../services/reportAPI.js";

export const useReports = (sessionId) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshReports = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError("");
      const data = await getReports(sessionId);
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load reports."
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  return { reports, loading, error, refreshReports, setReports };
};