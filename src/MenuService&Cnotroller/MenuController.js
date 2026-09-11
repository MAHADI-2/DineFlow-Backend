import { MenuService,getMenu,UpdateMenu,deleteMenu,addFoodReviewService } from "./MenuService.js";


export const MenuController = async (req, res) => {
    try {
        const body = req.body;
        const result = await MenuService(body);
        
        if (result.status === "success") {
            return res.status(201).json(result);
        } else {
            return res.status(400).json({
                status: "fail",
                message: result.message || "Failed to create menu item"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: "fail",
            message: "Something went wrong"
        });
    }
};


export const getMenuContrioller = async (req, res) => {
    try {
        const result = await getMenu();  // ✅ FIX
        if (result.status === "success") {
            return res.status(200).json(result);
        } else {
            return res.status(404).json(result);
        }
    } catch (error) {
        console.error("Error:", error);  // ✅ Debugging এর জন্য
        return res.status(500).json({
            status: "fail",
            message: error.message
        });
    }
};

export const UpdateMenuController = async (req, res) => {
    try {
        const body = req.body;
        const menu_id = req.params.menu_id;
        
        // যদি বডি অ্যারে আকারে আসে, তবে প্রথম অবজেক্টটি নিন, না হলে সরাসরি body নিন
        const updateFields = Array.isArray(body) ? body[0] : body;
        
        const data = { menu_id, ...updateFields };
        const result = await UpdateMenu(data);
        
        if (result.status === "success") {
            return res.status(200).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message
        });
    }
}



export const deleteMenuController = async (req, res) => {
    try {
        const menu_id = req.params.menu_id;
        const result = await deleteMenu(menu_id);
        if (result.status === "success") {
            return res.status(200).json(result);
        }
    } catch (error) {
        return res.status(500).json({
            status: "fail",
            message: error.message
        });
    }
}


export const addReviewController = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.headers.user_id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ status: "fail", message: "Rating must be between 1 and 5" });
    }

    const result = await addFoodReviewService(menuItemId, userId, undefined, rating, comment);

    if (result.status !== "success") {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "fail", message: error.message });
  }
};