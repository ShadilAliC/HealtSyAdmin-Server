import UserDb from "../models/user.model.js";

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sort = 'desc', letter = '' } = req.query;
  
    const query = {};
  
    if (letter) {
      query.$or = [
        { firstName: { $regex: `^${letter}`, $options: 'i' } },
        { pharmacyName: { $regex: `^${letter}`, $options: 'i' } },
        { therapeutic_classification: { $regex: `^${letter}`, $options: 'i' } },
      ];
    }
  
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchFields = [
        'firstName',
        'lastName',
        'pharmacyName',
        'email',
        'phone',
        'state',
        'city',
        'pharmacyAddress',
      ];
  
      const searchConditions = searchFields.map(field => ({ [field]: searchRegex }));
      if (letter) {
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }, 
        ];
      } else {
        query.$or = searchConditions;
      }
    }
  
    const sortOption = sort === 'desc' ? -1 : 1;
  
    const Users = await UserDb.find(query)
      .sort({ createdAt: sortOption })
      .skip((page - 1) * limit)
      .limit(Number(limit));
  
    const total = await UserDb.countDocuments(query);
  
    return res.status(200).json({
      success: true,
      message: Users.length ? "Users retrieved successfully" : "No Users found",
      data: Users,
      meta: {
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
      },
    });
  
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
}

export const getUserDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserDb.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user.",
      error: error.message,
    });
  }
};
