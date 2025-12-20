export default function PDFViewer ({fileUrl, fileTitle, defaultText = 'No document available.'}) {
    return (
        <div className="bg-gray-50 border rounded-xl overflow-hidden h-96 my-2">
            {fileUrl ? (
                <iframe
                    src={`${fileUrl}#toolbar=0`}
                    className="w-full h-full"
                    title={fileTitle}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">
                    {defaultText}
                </div>
            )}
        </div>
    )
}