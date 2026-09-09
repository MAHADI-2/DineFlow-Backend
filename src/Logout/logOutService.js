import User from "../model/User.js"

export const LogOutService=async(req,email)=>{

try {
    const userID= req.headers.user_id
    const user= await User.find(email)

    if(!user){
        return (400).json("user not found")
    }
    await User.deleteOne(userID)
    return (200).json("User Logout Successfully")
} catch (error) {
    return (400).json("something went wrong")
}


}