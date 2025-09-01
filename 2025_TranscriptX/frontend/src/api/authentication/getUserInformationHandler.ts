import axios from "axios";
import IRequest from "../../types/api/IRequest";
import API_PATH from "../API_PATH";

const getUserInformationHandler = async(request: IRequest) => {
    try{
        const response = await axios.get(`${API_PATH}/auth/users/me`, {
            headers: {
                authorization: `Bearer ${request.token}`, 
            },
        });

        return response.data;
    }catch (e){
        return e;
    }
};

export default getUserInformationHandler;