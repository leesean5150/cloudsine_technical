import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useAxiosGet = (
  initialUrl,
  initialParams = {},
  reloadOn = [],
  initialFetch = true
) => {
  axios.defaults.withCredentials = true;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(initialUrl);
  const [params, setParams] = useState(initialParams);
  const [shouldFetch, setShouldFetch] = useState(initialFetch);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url, { params });
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [url, params]);

  useEffect(() => {
    if (shouldFetch) {
      fetchData();
      setShouldFetch(false);
    }
  }, [fetchData, shouldFetch, url, ...reloadOn]);

  return {
    data,
    loading,
    error,
    setUrl,
    setParams,
    refetch: () => setShouldFetch(true),
  };
};

export default useAxiosGet;