import { UploadWidgetValue } from "@/types";
import { UploadCloud } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Upload_widget = ({ value = null, onChange, disabled = false }) => {

    const [preview, setPreview] = useState<UploadWidgetValue | null>(value);
    const [deleteToken, setDeleteToken] = useState<string | null>(null);
    const [isREmoving, setIsRemoving] = useState(false);

    const widgetRef = useRef<CloudinaryWidget | null>(null)
    const onChnageRef = useRef(onChange)

    useEffect(() => {
        setPreview(value);
        if (!value) setDeleteToken(null);
    }, [value])

    useEffect(() => {
        onChnageRef.current = onChange;
    }, [onChange])

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initializeWidget = () => {
            if (!window.cloudinary || widgetRef.current) return false;

            widgetRef.current = window.cloudinary.createUploadWidget({
                cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
                uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                multiple: false,
                folder: 'uploads',
                maxFileSize: 5000000,
                clientAllowedFormats: ["png", "jpg", "jpeg"],


            }, (error, result) => {
                if (!error && result.event === 'success') {
                    const payload: UploadWidgetValue = {
                        url: result.info.secure_url,
                        publicId: result.info.public_id
                    };
                    setPreview(payload);
                    setDeleteToken(result.info.delete_token ?? null);

                    onChnageRef.current?.(payload);
                }
            })
            return true;
        }
        if (initializeWidget()) return;
        const intervalId = window.setInterval(() => {
            if (initializeWidget()) {
                window.clearInterval(intervalId);
            }
        }, 500);
        return () => window.clearInterval(intervalId);
    }, [])

    const openWidget = () => {
        if (!disabled) widgetRef.current?.open();
    }

    const removeFromClaudinary = async () => {
        try {

        } catch (error) {

        }
    }


    return (
        <div className="space-y-2">
            {preview ? (
                <div className="upload-preview">
                    <img src={preview.url} alt="Preview" />
                </div>) :
                <div className="upload-dropzone"
                    role="button"
                    tabIndex={0}
                    onClick={openWidget}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            openWidget();
                        }
                    }}>

                    <div className="upload-prompt">
                        <UploadCloud className="icon" />
                        <div>
                            <p>Clock to uplaod Photo</p>
                            <p>PNG, JPG upto 5MB</p>
                        </div>
                    </div>


                </div>
            }

        </div>
    )
}
export default Upload_widget