import React, { useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";

import AnalysisDisplay from "../AnalysisDisplay/AnalysisDisplay.tsx";
import useAxiosDelete from "../../api/useAxiosDelete.ts";
import { config } from "../../config/config.ts";
import { endpoints } from "../../config/endpoints.ts";

import "./Table.css";


type FileType = {
  uuid: string;
  filename: string;
  created_at: string;
};

interface TableInCardProps {
  data: FileType[];
  refetch: () => void;
}

const TableInCard: React.FC<TableInCardProps> = ({ data, refetch }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  const deleteFile = useAxiosDelete(
    "",
    [],
    (res) => {
      setShowDeleteConfirmation(false);
      setSuccessMessage("File deleted successfully.");
      setErrorMessage("");
      refetch();
    },
    (err) => {
      setErrorMessage("Failed to delete file. Please try again.");
      setSuccessMessage("");
    }
  );

  const handleDelete = () => {
    if (fileToDelete) {
      deleteFile.setUrl(`${config.base_url}${endpoints.files.files}/${fileToDelete}`);
      deleteFile.refetch();
    }
  };

  const handleDeleteClick = (fileUuid) => {
    setFileToDelete(fileUuid);
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setFileToDelete(null);
  };

  const handleViewClick = (file) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  return (
    <div className="container">
      {(successMessage || errorMessage) && (
        <div className="notification-container">
          {successMessage && (
            <div className="save-notification">
              <span>{successMessage}</span>
              <button
                className="close-button"
                onClick={() => setSuccessMessage("")}
              >
                &times;
              </button>
            </div>
          )}
          {errorMessage && (
            <div className="notification">
              <span>{errorMessage}</span>
              <button
                className="close-button"
                onClick={() => setErrorMessage("")}
              >
                &times;
              </button>
            </div>
          )}
        </div>
      )}

      <div className="table-container">
        <div className="table-wrapper">
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>File Name</th>
                  <th>Date Uploaded</th>
                  <th className="relative">
                    <span className="sr-only">Analysis</span>
                  </th>
                  <th className="relative">
                    <span className="sr-only">Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((file) => (
                  <tr key={file.uuid}>
                    <td>{file.uuid}</td>
                    <td>{file.filename}</td>
                    <td>
                      {new Date(file.created_at).toLocaleString("en-US", {
                        timeZone: "Asia/Singapore",
                      })}
                    </td>
                    <td className="relative text-right">
                      <button
                        className="view-button"
                        onClick={() => handleViewClick(file)}
                      >
                        <FaEye />
                      </button>
                    </td>
                    <td className="relative text-right">
                      <button
                        className="view-button"
                        onClick={() => handleDeleteClick(file.uuid)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDeleteConfirmation && (
        <div className="modal-backdrop" onClick={handleCancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-dialog">
              <h3>Are you sure you want to delete this file?</h3>
              <div className="confirmation-buttons">
                <button className="btn-confirm" onClick={handleDelete}>Yes</button>
                <button className="btn-cancel" onClick={handleCancelDelete}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>
              &times;
            </button>
            <AnalysisDisplay analysis={selectedFile.analysis} />
          </div>
        </div>
      )}
    </div>
  );
};

export { TableInCard };
