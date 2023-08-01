import callMsGraph from "./microsoftAssets"

enum dataContentTypeOptions {
    video,
    image,
    unknown
}

export default async function getFileWithShareID(shareID: string, microsoftAccessToken: string): Promise<{ url: string; contentType: dataContentTypeOptions }> {
    const result = await callMsGraph(microsoftAccessToken, "https://graph.microsoft.com/v1.0/shares/" + shareID + "/driveItem")
    console.log(result)
    if (result.ok){
        const data = await result.json()
        console.log(data)
        if (data["@microsoft.graph.downloadUrl"] !== undefined && data["@microsoft.graph.downloadUrl"] !== null){
            if (data["file"]["mimeType"] === "image/gif") {
                return {url: data["@microsoft.graph.downloadUrl"], contentType: dataContentTypeOptions.image}
            } else if (data["file"]["mimeType"] === "video/mp4") {
                return {url: data["@microsoft.graph.downloadUrl"], contentType: dataContentTypeOptions.video}
            } else {
                throw "Error"
            }
        } else {
            throw "Error"
        }
    } else {
        throw "Error"
    }
}