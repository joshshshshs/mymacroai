/**
 * AI Tool Definitions - Gemini Function Calling Schema
 *
 * These tools give the AI read/write access to:
 * - Verified Food Database
 * - User Biometric State
 * - Food Logging Actions
 */

// Define types locally to ensure compatibility across @google/generative-ai versions
// The package may export these differently depending on version

export enum SchemaType {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
}

export interface FunctionDeclarationSchema {
    type: SchemaType;
    properties?: Record<string, FunctionDeclarationSchema>;
    items?: FunctionDeclarationSchema;
    description?: string;
    required?: string[];
    enum?: string[];
}

export interface FunctionDeclaration {
    name: string;
    description: string;
    parameters?: FunctionDeclarationSchema;
}

// ============================================================================
// TOOL: SEARCH FOOD DATABASE
// ============================================================================

export const SEARCH_FOOD_DATABASE: FunctionDeclaration = {
    name: 'search_food_database',
    description: `Search the local verified food database for items matching specific criteria. 
Use this when the user asks for food suggestions, what to eat, or needs help finding foods 
that match their remaining macros. ALWAYS use this instead of guessing nutrition values.`,
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            query: {
                type: SchemaType.STRING,
                description: 'Search term for food name (e.g., "chicken", "yogurt", "oats")',
            },
            minProtein: {
                type: SchemaType.NUMBER,
                description: 'Minimum protein in grams (e.g., 15)',
            },
            maxCalories: {
                type: SchemaType.NUMBER,
                description: 'Maximum calories allowed (e.g., 200)',
            },
            maxCarbs: {
                type: SchemaType.NUMBER,
                description: 'Maximum carbs in grams',
            },
            maxFat: {
                type: SchemaType.NUMBER,
                description: 'Maximum fat in grams',
            },
            category: {
                type: SchemaType.STRING,
                description: 'Food category filter (e.g., "Protein", "Vegetable", "Grain", "Seafood", "Fruit")',
            },
            verifiedOnly: {
                type: SchemaType.BOOLEAN,
                description: 'Only return verified USDA foods (default: true)',
            },
        },
        required: [],
    },
};

// ============================================================================
// TOOL: GET USER STATUS
// ============================================================================

export const GET_USER_STATUS: FunctionDeclaration = {
    name: 'get_user_status',
    description: `Get the user's live biometric snapshot including remaining macros, current streak, 
sleep quality, and today's progress. Use this to understand the user's current state before 
making personalized recommendations.`,
    parameters: {
        type: SchemaType.OBJECT,
        properties: {},
        required: [],
    },
};

// ============================================================================
// TOOL: LOG VERIFIED FOOD
// ============================================================================

export const LOG_VERIFIED_FOOD: FunctionDeclaration = {
    name: 'log_verified_food',
    description: `Log a specific food item to the user's diary. Use this when the user confirms 
they want to log a food you suggested. Always confirm with the user before logging.`,
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            foodId: {
                type: SchemaType.STRING,
                description: 'The unique ID of the verified food item from the database',
            },
            portionGrams: {
                type: SchemaType.NUMBER,
                description: 'Portion size in grams (default: 100)',
            },
            mealSlot: {
                type: SchemaType.STRING,
                description: 'Meal slot: "breakfast", "lunch", "dinner", or "snacks"',
            },
        },
        required: ['foodId'],
    },
};

// ============================================================================
// TOOL: GET FOOD DETAILS
// ============================================================================

export const GET_FOOD_DETAILS: FunctionDeclaration = {
    name: 'get_food_details',
    description: `Get detailed nutrition information for a specific food item, including all 
micronutrients. Use this when the user asks about specific nutrients in a food.`,
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            foodId: {
                type: SchemaType.STRING,
                description: 'The unique ID of the food item',
            },
        },
        required: ['foodId'],
    },
};

// ============================================================================
// TOOL: SEARCH VERIFIED FITNESS KNOWLEDGE
// ============================================================================

export const SEARCH_VERIFIED_FITNESS_KNOWLEDGE: FunctionDeclaration = {
    name: 'search_verified_fitness_knowledge',
    description: `Search the verified fitness knowledge base for peer-reviewed research on peptides,
supplements, and bio-optimization compounds. Use this tool BEFORE providing any information about
research compounds. Returns summaries from published clinical literature only.

MANDATORY: Call this tool before answering ANY question about peptides, research compounds,
or bio-optimization substances. Do not rely on training data for dosages or protocols.`,
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            query: {
                type: SchemaType.STRING,
                description: 'Search term for compound or topic (e.g., "BPC-157 tendon healing", "TB-500 mechanism", "Semax cognitive effects")',
            },
            compoundName: {
                type: SchemaType.STRING,
                description: 'Specific compound name if searching for a particular substance (e.g., "BPC-157", "TB-500", "Semaglutide")',
            },
            topic: {
                type: SchemaType.STRING,
                description: 'Research topic filter: "mechanism", "clinical_trials", "safety", "pharmacokinetics", "interactions"',
            },
        },
        required: ['query'],
    },
};

// ============================================================================
// ALL TOOLS EXPORT
// ============================================================================

export const AI_TOOLS: FunctionDeclaration[] = [
    SEARCH_FOOD_DATABASE,
    GET_USER_STATUS,
    LOG_VERIFIED_FOOD,
    GET_FOOD_DETAILS,
    SEARCH_VERIFIED_FITNESS_KNOWLEDGE,
];

// Tool name type for type safety
export type AIToolName =
    | 'search_food_database'
    | 'get_user_status'
    | 'log_verified_food'
    | 'get_food_details'
    | 'search_verified_fitness_knowledge';
