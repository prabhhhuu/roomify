import React, {useState, useCallback} from 'react';
import {useOutletContext} from "react-router";
import {CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";
import {PROGRESS_STEP, PROGRESS_INTERVAL_MS, REDIRECT_DELAY_MS} from "./lib/constants";

interface UploadProps {
    onComplete?: (base64Data: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onComplete }) => {

    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const { isSignedIn } = useOutletContext<AuthContext>();

    const processFile = useCallback((file: File) => {
        if (!isSignedIn) return;
        
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

  return (
    <div className={"upload"}>
        {!file ? (
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
                <p className={"help"}>Maximum file size upto 50 MB.</p>
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