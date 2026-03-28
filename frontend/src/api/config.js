import axios from "axios" 

const api = axios.create({
    baseURL:"https://braniac-66vs.onrender.com/api",
    withCredentials:true
})

export default api