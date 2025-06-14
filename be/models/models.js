// models.js
const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

/**
 * 1. ENUMS (as plain JS arrays for validation)
 */
const ROLE_TYPES = ['HOMEMAKER', 'FAMILY_MEMBER', 'ADMIN', 'GUEST'];
const PURCHASE_STATUS = ['PENDING', 'BOUGHT'];
const PLAN_TYPES = ['DAILY', 'WEEKLY'];
const REPORT_TYPES = ['PURCHASE_TREND', 'WASTE_STATISTICS', 'CONSUMPTION_ANALYSIS'];

/**
 * 2. DOMAIN SCHEMAS
 */

// 2.1. User schema
const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // you should hash in pre-save
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    role: { type: String, required: true, enum: ROLE_TYPES, default: 'HOMEMAKER' },
  },
  { timestamps: true }
);

// 2.2. Admin is a special User (just another document with role = 'ADMIN').

// 2.3. FoodCategory schema
const foodCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

// 2.4. Unit schema
const unitSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    abbreviation: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// 2.5. ShoppingListItem sub‐document schema
const shoppingListItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: Types.ObjectId, ref: 'FoodCategory', required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: Types.ObjectId, ref: 'Unit', required: true },
    status: { type: String, required: true, enum: PURCHASE_STATUS, default: 'PENDING' },
  },
  { _id: true }
);

// 2.6. ShoppingList schema
const shoppingListSchema = new Schema(
  {
    // ĐÃ SỬA: Đổi 'title' thành 'name' để khớp với request body của bạn
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    items: [shoppingListItemSchema], // embed items as sub-documents
    // ĐÃ SỬA: Đổi 'createdBy' thành 'ownedBy' để nhất quán
    ownedBy: { type: Types.ObjectId, ref: 'User', required: true },
    sharedWithGroup: { type: Types.ObjectId, ref: 'FamilyGroup' },
  },
  { timestamps: true }
);

// 2.7. FamilyGroup schema
const familyGroupSchema = new Schema(
  {
    groupName: { type: String, required: true, trim: true, unique: true },
    members: [{ type: Types.ObjectId, ref: 'User' }],
    shoppingLists: [{ type: Types.ObjectId, ref: 'ShoppingList' }],
  },
  { timestamps: true }
);

// 2.8. PantryItem schema
const pantryItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: Types.ObjectId, ref: 'Unit', required: true },
    expirationDate: { type: Date, required: true },
    location: { type: String, trim: true, default: '' },
    category: { type: Types.ObjectId, ref: 'FoodCategory', required: true },
    // ĐÃ KIỂM TRA: Đã là 'ownedBy', không cần thay đổi
    ownedBy: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// 2.9. RecipeIngredient sub‐document schema
const recipeIngredientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: Types.ObjectId, ref: 'Unit', required: true },
    category: { type: Types.ObjectId, ref: 'FoodCategory', required: true },
  },
  { _id: true }
);

// 2.10. Recipe schema
const recipeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true },
    servings: { type: Number, default: 1, min: 1 },
    ingredients: [recipeIngredientSchema], // embed as sub-documents
    // ĐÃ KIỂM TRA: Đã là 'ownedBy', không cần thay đổi
    ownedBy: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// 2.11. MealPlan schema
const mealPlanSchema = new Schema(
  {
    title: { type: String, required: true, trim: true }, // Thêm lại trường title cho MealPlan nếu cần, hoặc bỏ nếu không dùng
    date: { type: Date, required: true },
    type: { type: String, required: true, enum: PLAN_TYPES, default: 'DAILY' },
    recipes: [{ type: Types.ObjectId, ref: 'Recipe' }],
    // ĐÃ SỬA: Đổi 'createdBy' thành 'ownedBy' để nhất quán
    ownedBy: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// 2.12. Notification schema
const notificationSchema = new Schema(
  {
    // ĐÃ KIỂM TRA: 'user' là phù hợp cho Notification (người nhận thông báo), không cần thay đổi
    user: { type: Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true },
    sendDate: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 2.13. Report schema
const reportSchema = new Schema(
  {
    // ĐÃ KIỂM TRA: 'user' là phù hợp cho Report (người tạo/người nhận báo cáo), không cần thay đổi
    user: { type: Types.ObjectId, ref: 'User', required: true },
    generatedDate: { type: Date, default: Date.now },
    type: { type: String, required: true, enum: REPORT_TYPES },
    analyzedPantryItems: [{ type: Types.ObjectId, ref: 'PantryItem' }],
    analyzedShoppingListItems: [
      {
        shoppingList: { type: Types.ObjectId, ref: 'ShoppingList', required: true },
        itemId: { type: Types.ObjectId, required: true }, // refers to a sub-doc’s _id
      },
    ],
  },
  { timestamps: true }
);

/**
 * 3. MODEL EXPORTS
 */

const User = model('User', userSchema);
const FoodCategory = model('FoodCategory', foodCategorySchema);
const Unit = model('Unit', unitSchema);
const FamilyGroup = model('FamilyGroup', familyGroupSchema);
const ShoppingList = model('ShoppingList', shoppingListSchema);
const PantryItem = model('PantryItem', pantryItemSchema);
const Recipe = model('Recipe', recipeSchema);
const MealPlan = model('MealPlan', mealPlanSchema);
const Notification = model('Notification', notificationSchema);
const Report = model('Report', reportSchema);

module.exports = {
  User,
  FoodCategory,
  Unit,
  FamilyGroup,
  ShoppingList,
  PantryItem,
  Recipe,
  MealPlan,
  Notification,
  Report,
};