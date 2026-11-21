import react, {useContext} from "react";
import {Navigate,Outlet} from "react-router-dom";
import { UserContext } from "./UserContext";

const ProtectedRoute = ({allowedRoles})=>{
    const {userInfo, loading} = useContext(UserContext);
    if(loading) return <div className="text-center mt-5">Loading ...</div>
    
    if(!userInfo){
        return <Navigate to="/login" replace/>
    }
    if(allowedRoles && !allowedRoles.includes(userInfo.role)){
        return <Navigate to="/" replace/>
    }
    return <Outlet/>;
};
export default ProtectedRoute;