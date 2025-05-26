import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { TableInCard } from "../../components/Table/Table.tsx";
import { config } from "../../config/config.ts";
import { endpoints } from "../../config/endpoints.ts";
import LoadingOverlay from "../../components/LoadingOverlay/index.tsx";
import useAxiosGet from "../../api/useAxiosGet.ts";


import "./index.css";

const AnalysisPage = () => {
  const navigate = useNavigate();

  const fileList = useAxiosGet(config.base_url + endpoints.files.files,
    {},
    [],
    true
  );

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="analysis-page-container">
      {fileList.loading && <LoadingOverlay />}
      <button className="route-button back-arrow" onClick={handleBack}>
        <FaArrowLeft />
      </button>
      <TableInCard data={fileList.data} refetch={fileList.refetch} />
    </div>
  );
};

export { AnalysisPage };
