// models.js
const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

/**
 * 1. ENUMS (as plain JS arrays for validation)
 */
const ROLE_TYPES = ['HOMEMAKER', 'FAMILY_MEMBER', 'ADMIN'];
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
//     If you want a separate model, you can use discriminate(), but usually
//     storing role: 'ADMIN' inside the same collection is enough.

/* Example with discriminator (optional):
const Admin = userSchema.discriminator(
  'Admin',
  new Schema({
    // any admin‐specific fields (none for now)
  })
);
*/

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
    title: { type: String, required: true, trim: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    items: [shoppingListItemSchema], // embed items as sub-documents
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
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
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// 2.11. MealPlan schema
const mealPlanSchema = new Schema(
  {
    date: { type: Date, required: true },
    type: { type: String, required: true, enum: PLAN_TYPES, default: 'DAILY' },
    recipes: [{ type: Types.ObjectId, ref: 'Recipe' }], 
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// 2.12. Notification schema
const notificationSchema = new Schema(
  {
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

// Optionally export subdocument schemas if you need to reference them elsewhere:
module.exports = {
  User,
  // Admin can be created simply by: new User({ ..., role: 'ADMIN' })
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
