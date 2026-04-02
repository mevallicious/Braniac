import api from "./config";

export const uploadFile = async (file) =>{
    const formData =  new FormData()
    formData.append('file',file)

    const response = await api.post("/brain/upload" ,formData ,{
        headers:{'Content-Type': 'multipart/form-data'}
    })
    return response.data
}

export const saveLink = async (url) =>{
    const response = await api.post("/brain/save-link",{url})
    return response.data
}

export const getHistory = async () =>{
    const response = await api.get("/brain/history")
    return response.data
}

export const searchMemories  = async (query) =>{
    const response = await api.get(`/brain/search?q=${query}`)
    return response.data
}

export const deleteMemory = async (id) =>{
    const response = await api.delete(`/brain/${id}`)
    return response.data 
}

export const chatWithMemory = async (memoryId, message) => {
    const response = await api.post(`/brain/chat/${memoryId}`, { message });
    return response.data; 
};

export const saveNote = async (content) => {
    const response = await api.post("/brain/save", { 
        content, 
        type: 'text' 
    });
    return response.data;
};

export const getClusters = async () => {
    const response = await api.get("/brain/clusters");
    return response.data;
};