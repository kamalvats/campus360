const axios = require("axios")

async function createAssistantCampus360(context ) {
  // 1) Fetch context from Redis
  const context = context; 
  let url ="https://api.openai.com/v1/assistants"
  let key = ""
const data = JSON.stringify({
  "instructions": context,
  "name": "Campus360",
  "tools": [
    {
      "type": "code_interpreter"
    }
  ],
  "model": "gpt-5o"
});

  let createAssistant = await axios.post(url,headers: { 
    'Content-Type': 'application/json', 
    'Authorization': 'Bearer '+key, 
    'OpenAI-Beta': 'assistants=v2'
  },
  data : data)
}

module.exports = { createAssistantCampus360 };

const dbData = createAssistantCampus360(context)

let context =`You are Campus360 — an AI assistant for a Smart Campus / Smart Workspace platform.

Your job is to help users do ONLY these 3 core actions:

✅ Create Tickets (issue/complaint/service request)

✅ Cafe/Canteen Services (menu discovery + ordering)

✅ Control LCS Devices (turn ON/OFF, status change)

You do NOT execute database queries directly.
Instead, you must always return:

✅ A human-friendly response
✅ A strict JSON command that backend can safely execute

✅ INPUT DATA CONTEXT (campusData)

You will receive a dataset called campusData structured like:

cities[]

locations[]

locationCanteens[] (scope=LOCATION)

floors[]

floorCanteens[] (scope=FLOOR)

devices[]

clients[]

Your job is to follow this data exactly.

⚠️ CRITICAL RULES

✅ Never invent/hallucinate:

IDs

location names

canteen names

menu categories/subcategories/items

prices

ticket categories/subcategories

device names/types/subtypes

✅ Always validate from dataset.
If something is missing → ask a follow-up question.

============================================================
🧠 1) INTENT CLASSIFICATION (Mandatory)

Every user message MUST be classified into one intent for get info/ execute and more:

TICKET_CREATE

ORDER_CREATE

LAST_ORDER_CREATE

DEVICE_CONTROL

MENU_QUERY

GENERAL_QUERY

MULTI_INTENT

MULTI_INTENT rule

If user asks multiple actions in a single message, handle priority:

✅ DEVICE_CONTROL > ✅ TICKET_CREATE > ✅ ORDER_CREATE > ✅ MENU_QUERY

Return JSON as:

{
  "action": "bulk",
  "data": {
    "operations": [
      { ...operation1 },
      { ...operation2 }
    ]
  }
}

============================================================
📌 2) SUPPORTED FEATURES
✅ A) Ticket Creation

You can create tickets only if:

location exists

floor exists

client exists (if ticket requires client scope)

ticket category + subcategory exist

description is meaningful

✅ Required fields:

cityId, locationId, floorId

categoryId, subcategoryId

title, description

priority (default = Medium)

createdByUserId

✅ B) Cafe / Canteen Services

You support:

✅ discovery:

available cafes/canteens for a floor

show menu

show category/subcategory

search an item

suggest items under a budget

✅ ordering:

create food/beverage order

calculate totals

✅ Required fields for order:

cityId, locationId, floorId

canteenId

items[] with itemId, itemName, price, quantity

paymentMode (default = UPI)

deliveryPreference (default = Pickup)

createdByUserId

✅ Total checks:

itemTotal = price × quantity

grandTotal = sum(itemTotal)

✅ C) Device Control (LCS)

You can control devices:

ON / OFF

(optional) status query if backend supports

✅ Required fields:

cityId, locationId, floorId

deviceId + deviceName + type + subtype

command = ON | OFF

requestedByUserId

⚠️ Safety Confirmation Required:
If user says:

“Turn OFF all devices”

“Shutdown entire floor”
You MUST ask confirmation:
✅ “Confirm YES to proceed.”

============================================================
✅ 3) AVAILABILITY RULE (CANTEEN SCOPE)

Each location can have two types of canteens:

1) LOCATION-level canteens

Stored at:
location.canteens[] with scope="LOCATION"

serve all floors

usually physically present at serviceFloor (e.g., Ground Floor)

2) FLOOR-level cafes/canteens

Stored at:
floor.canteens[] with scope="FLOOR"

serve only that floor

When user asks:

"Which cafe is available on 4th floor?"
Return:
✅ all floor-level canteens of that floor
✅ plus all location-level canteens of that location

When user places order but doesn’t mention canteen:

If only ONE canteen is available → auto-select

If multiple → ask user to choose

If user chooses LOCATION scope canteen:
✅ tell user its serviceFloor (ex: “Ground Floor”), still allow order.

============================================================
✅ 4) VALIDATION RULES (Strict)

You MUST validate every request against campusData.

Location Validation

city must exist

location must exist under that city

floor must exist under that location

Ticket Validation

category must exist

subcategory must belong to that category

description ≥ 8 characters

priority default = Medium

Order Validation

canteen must exist (floor or location scope)

item must exist in menu

price must match dataset

quantity must be integer >= 1

item availability must be true if field exists

Device Validation

device must exist on floor/client scope

type/subtype must match device

command must be ON/OFF

bulk OFF requires confirmation

============================================================
🧩 5) CLARIFICATION RULES (Ask minimum)

If required fields are missing, ask only what is needed.

Ticket missing cases

Ask for:

which location/floor

category/subcategory

issue description

Order missing cases

Ask for:

which cafe/canteen

item name

quantity

payment mode (optional)

pickup/delivery preference (optional)

Device missing cases

Ask for:

which device name

which floor

ON or OFF

If user request is unclear:

Ask them to rephrase and show examples.

✅ Example prompts:

“Create ticket: AC not working on 4th floor (Client X)”

“Order 2 cold coffees from Cafe Aroma”

“Turn OFF meeting room lights on 4th floor”

============================================================
🔐 6) SAFETY & PERMISSION RULES

✅ Never do destructive actions without confirmation:

“Turn off all devices on floor”

bulk shutdown across floors

cancel large orders

✅ Always ask:
“Confirm YES to proceed.”

✅ Never reveal internal DB schema except the JSON output.

✅ Never store sensitive user data. Use only user-provided info.

============================================================
📤 7) OUTPUT FORMAT (MANDATORY)

EVERY response MUST be a strict JSON envelope:

{
  "assistant_message": "Human friendly message",
  "intent": "TICKET_CREATE|ORDER_CREATE|DEVICE_CONTROL|MENU_QUERY|GENERAL_QUERY|MULTI_INTENT",
  "missing_fields": [],
  "follow_up_questions": [],
  "json": null
}


✅ If missing_fields is NOT empty → json MUST be null.

============================================================
🗂️ 8) BACKEND EXECUTION JSON (Standard Actions)
✅ A) MENU_QUERY (Read operations)
{
  "action": "menu_query",
  "data": {
    "cityId": "",
    "locationId": "",
    "floorId": "",
    "canteenId": "",
    "queryType": "LIST_CANTEENS|SHOW_MENU|SHOW_CATEGORY|SEARCH_ITEM|ITEM_DETAILS|SUGGEST_ITEMS",
    "searchText": ""
  }
}

✅ B) ORDER_CREATE (Write)
{
  "action": "create_order",
  "data": {
    "cityId": "",
    "locationId": "",
    "floorId": "",
    "canteenId": "",
    "createdByUserId": "",
    "items": [
      {
        "itemId": "",
        "itemName": "",
        "price": 0,
        "quantity": 1,
        "total": 0,
        "notes": ""
      }
    ],
    "grandTotal": 0,
    "paymentMode": "Cash|UPI|Card|Wallet",
    "deliveryPreference": "Pickup|DeskDelivery"
  }
}

✅ C) TICKET_CREATE (Write)
{
  "action": "create_ticket",
  "data": {
    "cityId": "",
    "locationId": "",
    "floorId": "",
    "clientId": "",
    "categoryId": "",
    "subcategoryId": "",
    "title": "",
    "description": "",
    "priority": "Low|Medium|High|Urgent",
    "source": "campus360",
    "createdByUserId": ""
  }
}

✅ D) DEVICE_CONTROL (Write)
{
  "action": "device_control",
  "data": {
    "cityId": "",
    "locationId": "",
    "floorId": "",
    "clientId": "",
    "deviceId": "",
    "deviceType": "",
    "deviceSubtype": "",
    "deviceName": "",
    "command": "ON|OFF",
    "requestedByUserId": ""
  }
}

✅ E) MULTI_INTENT / BULK
{
  "action": "bulk",
  "data": {
    "operations": [
      { "action": "create_ticket", "data": { } },
      { "action": "create_order", "data": { } },
      { "action": "device_control", "data": { } }
    ]
  }
}

============================================================
✅ 9) DATA MATCHING RULES (Name → ID)

When user provides names, match:

✅ Case-insensitive
✅ Trim spaces
✅ Fuzzy match allowed for items ONLY

If multiple matches found:
Ask user to choose from options.

✅ Never guess wrong.


============================================================
✅ 10) FINAL CHECK BEFORE RETURNING JSON

Before returning backend JSON:

✅ Validate all IDs exist
✅ Validate canteen scope rules
✅ Validate prices & compute totals
✅ Validate device exists
✅ If missing anything → ask questions and return json=null

✅ END SYSTEM PROMPT

You are Campus360.
Always validate with campusData.
Never hallucinate.
Always return strict JSON output envelope."`


let data = [
  {
    "cityId": "CITY_001",
    "cityName": "Gurgaon",
    "locations": [
      {
        "locationId": "LOC_001",
        "locationName": "Smartworks Cyberhub",
        "canteens": [
          {
            "canteenId": "CAN_LOC_001",
            "canteenName": "Central Canteen",
            "type": "Canteen",
            "scope": "LOCATION",
            "serviceFloor": "Ground Floor",
            "isActive": true,
            "menu": {
              "categories": [
                {
                  "categoryId": "CAT_001",
                  "categoryName": "Breakfast",
                  "subcategories": [
                    {
                      "subcategoryId": "SUBCAT_001",
                      "subcategoryName": "Indian",
                      "items": [
                        {
                          "itemId": "ITEM_001",
                          "itemName": "Aloo Paratha",
                          "price": 60,
                          "isAvailable": true,
                          "description": "2 Parathas with curd & pickle"
                        },
                        {
                          "itemId": "ITEM_002",
                          "itemName": "Poha",
                          "price": 40,
                          "isAvailable": true,
                          "description": "Light breakfast with peanuts"
                        }
                      ]
                    }
                  ]
                },
                {
                  "categoryId": "CAT_002",
                  "categoryName": "Beverages",
                  "subcategories": [
                    {
                      "subcategoryId": "SUBCAT_002",
                      "subcategoryName": "Hot Beverages",
                      "items": [
                        {
                          "itemId": "ITEM_003",
                          "itemName": "Tea",
                          "price": 20,
                          "isAvailable": true,
                          "description": "Standard chai"
                        },
                        {
                          "itemId": "ITEM_004",
                          "itemName": "Coffee",
                          "price": 35,
                          "isAvailable": true,
                          "description": "Hot coffee"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        ],
        "floors": [
          {
            "floorId": "FLR_001",
            "floorName": "4th Floor",
            "canteens": [
              {
                "canteenId": "CAN_F_004_01",
                "canteenName": "Cafe Aroma",
                "type": "Cafe",
                "scope": "FLOOR",
                "isActive": true,
                "menu": {
                  "categories": [
                    {
                      "categoryId": "CAT_003",
                      "categoryName": "Coffee",
                      "subcategories": [
                        {
                          "subcategoryId": "SUBCAT_003",
                          "subcategoryName": "Cold Coffee",
                          "items": [
                            {
                              "itemId": "ITEM_005",
                              "itemName": "Cold Coffee",
                              "price": 80,
                              "isAvailable": true,
                              "description": "Chilled coffee with ice"
                            },
                            {
                              "itemId": "ITEM_006",
                              "itemName": "Chocolate Cold Coffee",
                              "price": 110,
                              "isAvailable": true,
                              "description": "Cold coffee with chocolate"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "categoryId": "CAT_004",
                      "categoryName": "Snacks",
                      "subcategories": [
                        {
                          "subcategoryId": "SUBCAT_004",
                          "subcategoryName": "Quick Bites",
                          "items": [
                            {
                              "itemId": "ITEM_007",
                              "itemName": "Veg Sandwich",
                              "price": 70,
                              "isAvailable": true,
                              "description": "Grilled veg sandwich"
                            },
                            {
                              "itemId": "ITEM_008",
                              "itemName": "French Fries",
                              "price": 90,
                              "isAvailable": false,
                              "description": "Currently out of stock"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            "devices": [
              {
                "deviceId": "DEV_001",
                "deviceType": "LIGHT",
                "deviceSubtype": "CABIN_LIGHT",
                "deviceName": "Cabin Light - 4F Zone A",
                "isActive": true
              },
              {
                "deviceId": "DEV_002",
                "deviceType": "AC",
                "deviceSubtype": "CENTRAL_AC",
                "deviceName": "Central AC - 4F",
                "isActive": true
              }
            ],
            "clients": [
              {
                "clientId": "CL_001",
                "clientName": "Prodigal AI",
                "officeArea": "4F Wing A",
                "isActive": true
              },
              {
                "clientId": "CL_002",
                "clientName": "Mobiloitte",
                "officeArea": "4F Wing B",
                "isActive": true
              }
            ]
          }
        ]
      },
      {
        "locationId": "LOC_002",
        "locationName": "Smartworks Udyog Vihar",
        "canteens": [
          {
            "canteenId": "CAN_LOC_002",
            "canteenName": "Udyog Central Kitchen",
            "type": "Canteen",
            "scope": "LOCATION",
            "serviceFloor": "1st Floor",
            "isActive": true,
            "menu": {
              "categories": [
                {
                  "categoryId": "CAT_005",
                  "categoryName": "Lunch",
                  "subcategories": [
                    {
                      "subcategoryId": "SUBCAT_005",
                      "subcategoryName": "North Indian",
                      "items": [
                        {
                          "itemId": "ITEM_009",
                          "itemName": "Dal Makhani + Rice",
                          "price": 150,
                          "isAvailable": true,
                          "description": "Creamy dal with rice"
                        },
                        {
                          "itemId": "ITEM_010",
                          "itemName": "Paneer Butter Masala + Naan",
                          "price": 190,
                          "isAvailable": true,
                          "description": "Paneer curry with 2 naan"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        ],
        "floors": [
          {
            "floorId": "FLR_002",
            "floorName": "2nd Floor",
            "canteens": [
              {
                "canteenId": "CAN_F_002_01",
                "canteenName": "Tea Corner",
                "type": "Cafe",
                "scope": "FLOOR",
                "isActive": true,
                "menu": {
                  "categories": [
                    {
                      "categoryId": "CAT_006",
                      "categoryName": "Beverages",
                      "subcategories": [
                        {
                          "subcategoryId": "SUBCAT_006",
                          "subcategoryName": "Tea",
                          "items": [
                            {
                              "itemId": "ITEM_011",
                              "itemName": "Masala Tea",
                              "price": 25,
                              "isAvailable": true,
                              "description": "Spiced masala chai"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            "devices": [
              {
                "deviceId": "DEV_003",
                "deviceType": "LIGHT",
                "deviceSubtype": "LOBBY_LIGHT",
                "deviceName": "Lobby Light - 2F",
                "isActive": true
              }
            ],
            "clients": [
              {
                "clientId": "CL_003",
                "clientName": "FinTech Co.",
                "officeArea": "2F Wing A",
                "isActive": true
              }
            ]
          }
        ]
      }
    ]
  },

  {
    "cityId": "CITY_002",
    "cityName": "Noida",
    "locations": [
      {
        "locationId": "LOC_003",
        "locationName": "Smartworks Noida Sector 62",
        "canteens": [
          {
            "canteenId": "CAN_LOC_003",
            "canteenName": "Noida Food Court",
            "type": "Canteen",
            "scope": "LOCATION",
            "serviceFloor": "Ground Floor",
            "isActive": true,
            "menu": {
              "categories": [
                {
                  "categoryId": "CAT_007",
                  "categoryName": "Fast Food",
                  "subcategories": [
                    {
                      "subcategoryId": "SUBCAT_007",
                      "subcategoryName": "Burgers",
                      "items": [
                        {
                          "itemId": "ITEM_012",
                          "itemName": "Veg Burger",
                          "price": 90,
                          "isAvailable": true,
                          "description": "Classic veg burger"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        ],
        "floors": [
          {
            "floorId": "FLR_003",
            "floorName": "6th Floor",
            "canteens": [
              {
                "canteenId": "CAN_F_006_01",
                "canteenName": "Healthy Bowl",
                "type": "Cafe",
                "scope": "FLOOR",
                "isActive": true,
                "menu": {
                  "categories": [
                    {
                      "categoryId": "CAT_008",
                      "categoryName": "Healthy",
                      "subcategories": [
                        {
                          "subcategoryId": "SUBCAT_008",
                          "subcategoryName": "Salads",
                          "items": [
                            {
                              "itemId": "ITEM_013",
                              "itemName": "Greek Salad",
                              "price": 160,
                              "isAvailable": true,
                              "description": "Veg salad with feta style topping"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            "devices": [
              {
                "deviceId": "DEV_004",
                "deviceType": "AC",
                "deviceSubtype": "SPLIT_AC",
                "deviceName": "Split AC - 6F Zone C",
                "isActive": true
              }
            ],
            "clients": [
              {
                "clientId": "CL_004",
                "clientName": "EdTech Startup",
                "officeArea": "6F Wing C",
                "isActive": true
              }
            ]
          }
        ]
      }
    ]
  },

  {
    "cityId": "CITY_003",
    "cityName": "Bangalore",
    "locations": [
      {
        "locationId": "LOC_004",
        "locationName": "Smartworks MG Road",
        "canteens": [
          {
            "canteenId": "CAN_LOC_004",
            "canteenName": "MG Food Hub",
            "type": "Canteen",
            "scope": "LOCATION",
            "serviceFloor": "Ground Floor",
            "isActive": true,
            "menu": {
              "categories": [
                {
                  "categoryId": "CAT_009",
                  "categoryName": "South Indian",
                  "subcategories": [
                    {
                      "subcategoryId": "SUBCAT_009",
                      "subcategoryName": "Dosa",
                      "items": [
                        {
                          "itemId": "ITEM_014",
                          "itemName": "Masala Dosa",
                          "price": 120,
                          "isAvailable": true,
                          "description": "Dosa with aloo masala"
                        },
                        {
                          "itemId": "ITEM_015",
                          "itemName": "Plain Dosa",
                          "price": 90,
                          "isAvailable": true,
                          "description": "Crispy dosa with chutney"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        ],
        "floors": [
          {
            "floorId": "FLR_004",
            "floorName": "3rd Floor",
            "canteens": [
              {
                "canteenId": "CAN_F_003_01",
                "canteenName": "Cafe Bengaluru",
                "type": "Cafe",
                "scope": "FLOOR",
                "isActive": true,
                "menu": {
                  "categories": [
                    {
                      "categoryId": "CAT_010",
                      "categoryName": "Beverages",
                      "subcategories": [
                        {
                          "subcategoryId": "SUBCAT_010",
                          "subcategoryName": "Coffee",
                          "items": [
                            {
                              "itemId": "ITEM_016",
                              "itemName": "Filter Coffee",
                              "price": 40,
                              "isAvailable": true,
                              "description": "Traditional South filter coffee"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            "devices": [
              {
                "deviceId": "DEV_005",
                "deviceType": "LIGHT",
                "deviceSubtype": "MEETING_LIGHT",
                "deviceName": "Meeting Room Light - 3F",
                "isActive": true
              }
            ],
            "clients": [
              {
                "clientId": "CL_005",
                "clientName": "AI Startup Bengaluru",
                "officeArea": "3F Wing A",
                "isActive": true
              }
            ]
          }
        ]
      }
    ]
  }
];





