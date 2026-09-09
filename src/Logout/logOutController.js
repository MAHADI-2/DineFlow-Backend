import { LogOutService } from "./logOutService.js";

export const logout=async(req,res)=>{

try {
    const result= await LogOutService(req)

    res.status(200).json(result)
} catch (error) {
    res.status(400).json("somethink went worng")
}

}