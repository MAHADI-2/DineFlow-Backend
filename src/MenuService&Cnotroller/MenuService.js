import MenuItem from "../model/MenuItem.js";



export const MenuService = async (data) => {
  try {
    const menuitem = await MenuItem.create(data);
    if (!menuitem) {
      return { status: "fail", message: "Failed to create menu item" };
    }

    return { status: "success", data: menuitem };
  } catch (error) {
    console.log("Mongoose আসল এরর:", error.message);
    return { status: "fail", message: error.message };
  }
};

// কাস্টমার খাবারের রেটিং ও রিভিউ যোগ করার সার্ভিস
export const addFoodReviewService = async (menuItemId, userId, userName, rating, comment = "") => {
  try {
    const item = await MenuItem.findById(menuItemId);
    if (!item) {
      return { status: "fail", message: "Food item not found" };
    }

    // নতুন রিভিউ অবজেক্ট তৈরি
    const newReview = {
      userId,
      userName: userName || "Customer",
      rating: Number(rating),
      comment: comment || "",
      createdAt: new Date(),
    };

    // রিভিউ লিস্টে যুক্ত করা
    item.reviews.push(newReview);
    item.numReviews = item.reviews.length;

    // গড় রেটিং হিসাব (Average Calculation)
    const totalScore = item.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    item.rating = Number((totalScore / item.reviews.length).toFixed(1));

    await item.save();

    return {
      status: "success",
      message: "Review and rating saved successfully",
      data: {
        rating: item.rating,
        numReviews: item.numReviews,
      },
    };
  } catch (error) {
    console.log("Rating error:", error.message);
    return { status: "fail", message: error.message };
  }
};



export const getMenu = async (req) => {
    try {
       const data = await MenuItem.find({});
        if (!data || data.length === 0) {
            return { status: "fail", message: "Menu data not found" };
        }
        return { status: "success", menus: data }; // এখানে data এর বদলে menus দিতে হবে
    } catch (error) {
        return { status: "fail", message: error.message };
    }
};


export const UpdateMenu = async (data) => {
    try {
        const menuId = data.menu_id;
        
        // ডেটা থেকে menu_id বাদ দিয়ে বাকি ফিল্ডগুলো আলাদা করুন
        const { menu_id: _, ...updateFields } = data;

        const updatedData = await MenuItem.findByIdAndUpdate(
            menuId, 
            updateFields, 
            { new: true, runValidators: true }
        );

        if (!updatedData) {
            return { status: "fail", message: "Menu data not found" };
        }
        return { status: "success", data: updatedData };

    } catch (error) {
        return { status: "fail", message: error.message };
    }
}

export const deleteMenu = async (menuId) => {
    try {
        const deletedData = await MenuItem.findByIdAndDelete(menuId);
        if (!deletedData) {
            return { status: "fail", message: "Menu data not found" };
        }
        return { status: "success", data: deletedData };
    } catch (error) {
        return { status: "fail", message: error.message };
    }
}