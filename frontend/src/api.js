import axios from "axios";

const API = axios.create({
    baseURL: "https://pngwale.com/api", // 🔥 IMPORTANT
});

export default API;