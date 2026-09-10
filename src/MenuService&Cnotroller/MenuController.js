import { MenuService,getMenu,UpdateMenu,deleteMenu,addFoodReviewService } from "./MenuService.js";

export const MenuController = async (req, res) => {
    try {
        const body = { ...req.body };
        if (typeof body.category === "string") {
            const category = body.category.trim().toLowerCase();
            body.category = category ? category.charAt(0).toUpperCase() + category.slice(1) : category;
        }
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
        res.set("Cache-Control", "no-store");
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
        const body = Array.isArray(req.body) ? req.body[0] : req.body;
        const menu_id = req.params.menu_id || req.params.id || body?._id || body?.id;
        if (!menu_id) {
            return res.status(400).json({ status: "fail", message: "Menu item ID is required" });
        }
        
        const data = { menu_id, ...body };
        const result = await UpdateMenu(data);
        
        if (result.status === "success") {
            return res.status(200).json(result);
        }
        return res.status(404).json(result);
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
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ status: "fail", message: "Rating must be between 1 and 5" });
    }

        const result = await addFoodReviewService(
            menuItemId,
            req.headers.user_id,
            req.headers.email,
            rating
        );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "fail", message: error.message });
  }
};

export const uploadMenuImageController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "fail", message: "No image file uploaded" });
    }
    const imagePath = req.file.path;
    return res.status(200).json({ status: "success", image: imagePath });
  } catch (error) {
    return res.status(500).json({ status: "fail", message: error.message });
  }
};