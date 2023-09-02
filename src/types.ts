export enum loadingStateEnum {
    loading,
    success,
    failed,
    notStarted,
    cannotStart,
    offline
}

export enum dataContentTypeOptions {
    video,
    image,
    pdf,
    unknown
}

export enum taskImportanceEnum {
    low,
    normal,
    high
}

export enum resourceResponce {
    found,
    notFound,
    failed
}


export enum commissionTypeEnum {
    Issued,
    Location,
    Image,
    ImageLocation,
    QRCode
}

declare global {
    type TaskType = {
        name: string
        id: string
        listId: string
        importance: taskImportanceEnum
    }
}