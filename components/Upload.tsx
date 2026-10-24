import React, {useState, useCallback} from 'react';
import {useOutletContext} from "react-router";
import {CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";
import {PROGRESS_STEP, PROGRESS_INTERVAL_MS, REDIRECT_DELAY_MS, MAX_FILE_SIZE, ALLOWED_TYPES} from "./lib/constants";

interface UploadProps {
    onComplete?: (base64Data: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onComplete }) => {

    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const { isSignedIn } = useOutletContext<AuthContext>();

    const processFile = useCallback((file: File) => {
        if (!isSignedIn) return;

        // Clear any previous error before validating
        setError(null);

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
            setError("Unsupported file format. Please upload a JPG or PNG image.");
            return;
        }

        // Validate file size (10 MB limit)
        if (file.size > MAX_FILE_SIZE) {
            setError("File is too large. Maximum size is 10 MB.");
            return;
        }

        setFile(file);
        setProgress(0);
        
        const reader = new FileReader();
        reader.onload = () => {
            const base64Data = reader.result as string;

            const interval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + PROGRESS_STEP;
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        setProgress(100);

                        setTimeout(() => {
                            onComplete?.(base64Data);
                        }, REDIRECT_DELAY_MS);

                        return 100;
                    }
                    return newProgress;
                });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.onerror = () => {
            setFile(null);
            setProgress(0);
            setError("Failed to read file. Please try again.");
        };
        reader.readAsDataURL(file);
    }, [isSignedIn, onComplete]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (isSignedIn) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (!isSignedIn) return;
        
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            const droppedFile = droppedFiles[0];
            processFile(droppedFile);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            const selectedFile = selectedFiles[0];
            processFile(selectedFile);
        }
    };

    const handleErrorDismiss = () => {
        setError(null);
    };

  return (
    <div className={"upload"}>
        {error ? (
            <div className={"error-message"}>
                <p>{error}</p>
                <button onClick={handleErrorDismiss}>Try again</button>
            </div>
        ) : !file ? (
            <div
                className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className={"drop-input"}
                    accept={".jpg, .jpeg, .png"}
                    disabled={!isSignedIn}
                    onChange={handleChange}
                />
                <div className={"drop-content"}>
                    <div className={"drop-icon"}>
                        <UploadIcon size={20}/>
                    </div>
                </div>
                <p>
                    {isSignedIn ? ("Click to upload or just drag and drop") : ("Sign in or Sign up with puter to upload")}
                </p>
                <p className={"help"}>Maximum file size up to 10 MB.</p>
            </div>
        ) : (
            <div className={"upload-status"}>
                <div className={"status-content"}>
                    <div className={"status-icon"}>
                        {progress === 100 ? (
                            <CheckCircle2 className={"check"}/>
                        ):(
                            <ImageIcon className={"image"}/>
                        )}
                    </div>
                    <h3>{file.name}</h3>

                    <div className={"progress"}>
                        <div className={"bar"} style={{width: `${progress}%`}}/>

                        <p className={"status-text"}>
                            {progress < 100 ? 'Analysing Floor Plan...' : 'Redirecting...'}
                        </p>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Upload;