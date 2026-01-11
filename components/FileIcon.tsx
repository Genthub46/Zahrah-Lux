
import React from 'react';

interface FileIconProps {
    filename: string;
    className?: string; // Additional classes
}

const FileIcon: React.FC<FileIconProps> = ({ filename, className = "" }) => {
    const ext = filename ? filename.split('.').pop()?.toLowerCase() || '' : '';

    return (
        <span className={`fiv-viv fiv-icon-${ext} ${className}`}></span>
    );
};

export default FileIcon;
