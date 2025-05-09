import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

import FileUpload from "../../components/FileUpload/FileUpload.tsx";
import AnalysisDisplay from "../../components/AnalysisDisplay/AnalysisDisplay.tsx";
import LoadingOverlay from "../../components/LoadingOverlay/index.tsx";
import useAxiosPost from "../../api/useAxiosPost.ts";
import { config } from "../../config/config.ts";
import { endpoints } from "../../config/endpoints.ts";

import "./index.css";

const Home = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [data, setData] = useState<{}>({});
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [notificationMessage, setNotificationMessage] = useState<string>("");
    const [postRequestError, setPostRequestError] = useState<boolean>(false);

    const navigate = useNavigate();

    const fileSubmission = useAxiosPost(
        config.base_url + endpoints.files.scan,
        new FormData(),
        [],
        (res) => {
            console.log("Upload Success:", res);
            setErrorMessage("");
            setPostRequestError(false);
        },
        (err) => {
            console.error("Upload Error:", err);
            setErrorMessage("File upload failed. Please try again.");
            setPostRequestError(true);
            setSelectedFile(null);
            setData({});
        }
    );

    const saveFileData = useAxiosPost(
        config.base_url + endpoints.files.save_analysis,
        new FormData(),
        [],
        (res) => {
            setNotificationMessage("File saved.");
        },
        (err) => {
            setErrorMessage("File upload failed. Please try again.");
        }
    )

    const onFileSelect = (file: File) => {
        setSelectedFile(file);
        setPostRequestError(false);
        setData({});
    };

    const handleUploadClick = () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        fileSubmission.setBody(formData);
        fileSubmission.refetch();
    };

    const handleSaveFile = (e: ChangeEvent<HTMLInputElement>) => {
        if (!data || !data.data || data.data.attributes.status !== "completed") return;

        const formData = new FormData();
        formData.append("filename", selectedFile.name);
        formData.append("analysis", JSON.stringify({ data: data.data }));
        saveFileData.setBody(formData);
        saveFileData.refetch();
    }

    const handleNavigate = () => {
        navigate("/analysis-table");
    }

    useEffect(() => {
        if (fileSubmission.data) {
            setData(fileSubmission.data);
        }
    }, [fileSubmission.data]);

    return (
        <>
            {errorMessage && (
                <div className="notification-container">
                    <div className="notification">
                        <span>{errorMessage}</span>
                        <button
                            className="close-button"
                            onClick={() => setErrorMessage("")}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
            {notificationMessage && (
                <div className="notification-container">
                    <div className="save-notification">
                        <span>{notificationMessage}</span>
                        <button
                            className="close-button"
                            onClick={() => setNotificationMessage("")}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
            {fileSubmission.loading && <LoadingOverlay />}
            <FileUpload
                onFileSelect={onFileSelect}
                handleUploadClick={handleUploadClick}
                isPostRequestError={postRequestError}
                handleSaveFile={handleSaveFile}
            />
            <div className="analysis-section">
                <AnalysisDisplay analysis={data} />
                <div className="route-button-container">
                    <button className="route-button" onClick={handleNavigate}>
                        <FaArrowRight />
                    </button>
                </div>
            </div>
        </>
    );
};

export { Home };
