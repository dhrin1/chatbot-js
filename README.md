php

[
[
"prompt" => [],
"formControl" => [
[
"type" => "img",
"property" => [
"src" => "https://cash-pocket.net/chatbot/assets/banner-img.png",
"alt" => "banner",
]
]
]
],
[
"prompt" => ["キャッシュポケットをご利用いただきありがとうございます！<br>こちらから簡単に現金化のお申し込みができます ♪"], //Thank you for using Cash Pocket ! You can deposit yourtmhronuegyh. tAhneapurotocmesaste.d operator will guide you
"formControl" => []
],
[
"prompt" => ["まずは当社のご利用回数を教えてください"], // First, please tell us how many times you have used our services.
"formTitle" => [], // Number of times you have used our service
"formControl" => [
[
"type" => "button-group",
"property" => [
"name" => "usehistory",
"value" => "",
"label" => "当社のご利用回数",
"field_label" => "当社の利用回数",
"option" => [
["label" => "初めて", "value" => 1],
["label" => "2 回目以降", "value" => 2],
],
],
"rule" => [
"accept" => [1, 2],
"error" => [
"type" => "info", // info, list, none
"message" => [
"ご本人様名義以外のクレジットカードはご利用いただけません。"
]
]
]
],
],
"response" => [
[
"text" => ["{0}のご利⽤ですね！ありがとうございます。",], //This is your first time using our service! Thank you very much.
"format" => ["text"]
],
]
],
[
"prompt" => ["次にお名前をご入力ください"],
"formControl" => [
[
"type" => "text",
"property" => [
"name" => "name1",
"label" => "名前",
"field_label" => "名前",
"value" => "",
"placeholder" => "山田 花子"
]
],
[

                                "type" => "text",
                                "property" => [
                                    "name" => "name2",
                                    "label" => "フリガナ",
                                    "field_label" => "フリガナ",
                                    "value" => "",
                                    "placeholder" => "ヤマダ ハナコ",
                                ]

                            ]
                        ],
                        "response" => [
                            [
                                "text" => ["{0}様ですね！ありがとうございます。",],
                                "format" => ["text"]
                            ]
                        ]
                    ],
                    [
                        "prompt" => ["ご連絡先の入力をお願いいたします。"], //Please enter your contact information.
                        "formControl" => [
                            [
                                "type" => "tel",
                                "property" => [
                                    "name" => "tel2",
                                    "label" => "電話番号",
                                    "field_label" => "電話番号",
                                    "value" => "",
                                    "placeholder" => "08012341234※半角・ハイフンなし"
                                ]

                            ],
                            [
                                "type" => "email",
                                "property" => [
                                    "name" => "email",
                                    "label" => "電子メール",
                                    "field_label" => "電子メールアドレス",
                                    "value" => "",
                                    "placeholder" => "taro@cash-pocket.co.jp"
                                ]

                            ],
                        ],
                        "response" => [
                            [
                                "text" => ["電話番号は{0}とメールアドレスは{1}ですね！ありがとうございます。"],
                                "format" => ["text"]
                            ]
                        ]
                    ],

                    [
                        "prompt" => ["ご利用するカード種別をご選択ください"],
                        "formControl" => [
                            [
                                "type" => "select", //Card Selection
                                "property" => [
                                    "name" => "virtualcardtype",
                                    "label" => "カード選択",
                                    "field_label" => "カード種別",
                                    "value" => "",
                                    "option" => [
                                        ["label" => "未選択",  "value" => 99],
                                        ["label" => "クレジットカード",  "value" => 1],
                                        ["label" => "paidy",  "value" => 2],
                                        ["label" => "バンドル",  "value" => 3],
                                        ["label" => "auペイ",  "value" => 4],
                                        ["label" => "メルペイ",  "value" => 5],
                                        ["label" => "その他",  "value" => 6],
                                    ],
                                    "placeholder" => "",
                                ],
                                "rule" => [
                                    "accept" => [1, 2, 3, 4, 5, 6],
                                    "error" => [
                                        "type" => "list",
                                        "message" => [
                                            "カードを選択してください"
                                        ]
                                    ]
                                ]

                            ],
                            [
                                "type" => "radio",
                                "property" => [
                                    "name" => "cardHolderType",
                                    "label" => "ご本人様名義のクレジットカードですか？",
                                    "field_label" => "カードホルダータイプ",
                                    "value" => "",
                                    "option" => [
                                        ["label" => "はい",  "value" => 1],
                                        ["label" => "いいえ",  "value" => 2],
                                    ],
                                    "placeholder" => ""
                                ],
                                "rule" => [
                                    "accept" => [1],
                                    "error" => [
                                        "type" => "info",
                                        "message" => [
                                            "ご本人様名義以外のクレジットカードはご利用いただけません。"
                                        ]
                                    ]
                                ]

                            ],
                        ],
                        "response" => [
                            [
                                "text" => ["{0}ですね！ありがとうございます。"],
                                "format" =>  ["text"]
                            ]
                        ]
                    ],

                    [
                        "prompt" => ["次にご利⽤希望⾦額を⼊⼒ください"], // Next, enter the amount you wish to use.
                        "formControl" => [
                            [
                                "type" => "number",
                                "property" => [
                                    "name" => "amount",
                                    "label" => "ご利用希望金額",
                                    "field_label" => "利用希望金額",
                                    "value" => "",
                                    "pattern" => ""
                                ],
                                "description" => "万円"

                            ],

                        ],
                        "response" => [
                            [
                                "text" => ["{0}万円ですね！ありがとうございます。"],
                                "format" =>  ["text"]
                            ]
                        ]
                    ],

                    [
                        "prompt" => ["ご入力ありがとうございます！", "ご本人様確認をさせていただいた後、お振込手続きを進めます。"],
                        "formControl" => [
                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/instructions-1.png",
                                    "alt" => "banner",
                                ]
                            ]
                        ]

                    ],
                    [
                        "prompt" => ["ご本人確認書類をご提出ください"],
                        "formTitle" => [""],
                        "formControl" => [
                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/valid-id.png",
                                    "alt" => "banner",
                                ]
                            ],

                            [
                                "type" => "file",
                                "property" => [
                                    "name" => "file1",
                                    "label" => "身分証明書　表面",
                                    "field_label" => "身分証明書　表面",
                                    "value" => "",
                                    "pattern" => ""
                                ],
                            ],
                            [
                                "type" => "file",
                                "property" => [
                                    "name" => "file2",
                                    "label" => "身分証明書　裏面",
                                    "field_label" => "身分証明書　裏面",
                                    "value" => "",
                                    "pattern" => ""
                                ],
                            ],
                        ],
                        "response" => [
                            [
                                "text" => ["{1}</br>身分証明書　表面", "{2}</br>身分証明書　裏面"],
                                "format" =>  ["uploading"]
                            ]
                        ]

                    ],

                    [
                        "prompt" => ["クレジットカードの画像をご提出ください"],
                        "formTitle" => [""],
                        "formControl" => [
                            [
                                "type" => "select",
                                "property" => [
                                    "name" => "virtualcardtype",
                                    "label" => "カード選択",
                                    "field_label" => "カード種別",
                                    "value" => "",
                                    "option" => [
                                        ["label" => "未選択",  "value" => 99],
                                        ["label" => "クレジットカード",  "value" => 1],
                                        ["label" => "paidy",  "value" => 2],
                                        ["label" => "バンドル",  "value" => 3],
                                        ["label" => "auペイ",  "value" => 4],
                                        ["label" => "メルペイ",  "value" => 5],
                                        ["label" => "その他",  "value" => 6],
                                    ],
                                    "placeholder" => "",
                                ],
                                "rule" => [
                                    "accept" => [1, 2, 3, 4, 5, 6],
                                    "error" => [
                                        "type" => "list",
                                        "message" => ["カードを選択してください"]
                                    ]
                                ]

                            ],


                            [
                                "type" => "file",
                                "property" => [
                                    "name" => "file4",
                                    "label" => "クレジットカード　表面",
                                    "field_label" => "クレジットカード　表面",
                                    "value" => "",
                                    "pattern" => ""
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [99, 1, 4, 5, 6]    // virtual card
                                ]
                            ],

                            [
                                "type" => "file",
                                "property" => [
                                    "name" => "file5",
                                    "label" => "クレジットカード　裏面",
                                    "field_label" => "クレジットカード　裏面",
                                    "value" => "",
                                    "pattern" => ""
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [99, 1, 4, 5, 6]  // virtual card
                                ]
                            ],


                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/virtual-card.png",
                                    "alt" => "banner",
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [99, 1, 4, 5, 6],    // virtual card
                                ]
                            ],

                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/paidy.png",
                                    "alt" => "banner",
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [2] // paidly
                                ]
                            ],

                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/vandle-instruction-1.png",
                                    "alt" => "banner",
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [2, 3]   // paidly and vandlecard
                                ]
                            ],

                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/vandlecard.png",
                                    "alt" => "banner",
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [3] // vandlecard
                                ]
                            ],


                            [
                                "type" => "file",
                                "property" => [
                                    "name" => "file7",
                                    "label" => "クレジットカード　裏面 - ",
                                    "field_label" => "クレジットカード　裏面",
                                    "value" => "",
                                    "pattern" => ""
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [2, 3]    //paidly and vandlecard
                                ]
                            ],

                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/logo_paidy.png",
                                    "alt" => "banner",
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [2]   //paidly
                                ]
                            ],

                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/paidy_instruction.png",
                                    "alt" => "banner",
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [2]  //paidly
                                ]
                            ],

                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/example_paidy.png",
                                    "alt" => "banner",
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [2]  //paidly
                                ],
                            ],


                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/logo_vandlecard.jpg",
                                    "alt" => "banner",
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [3] // vandlecard
                                ]
                            ],

                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/vandle-instruction-2.png",
                                    "alt" => "banner",
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [3]  // vandlecard
                                ]
                            ],

                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/example_vandlecard.png",
                                    "alt" => "banner",
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [3] // vandlecard
                                ]
                            ],

                            [
                                "type" => "file",
                                "property" => [
                                    "name" => "file6",
                                    "label" => "クレジットカード　裏面",
                                    "field_label" => "クレジットカード　裏面",
                                    "value" => "",
                                    "pattern" => ""
                                ],
                                "is_view" => [
                                    "virtualcardtype" => [2, 3]  // paidly and vandlecard
                                ]
                            ],
                        ],
                        "response" => [
                            [
                                "text" => ["{0}", "{1}{2}{3}{4}{5}{7}{8}{9}{10}"],
                                "format" =>  ["uploading"]
                            ],
                        ]

                    ],
                    [
                        "prompt" => ["お顔のお写真をご提出ください"],
                        "formTitle" => [""],
                        "formControl" => [
                            [
                                "type" => "img",
                                "property" => [
                                    "src" => "https://cash-pocket.net/chatbot/assets/face-photo.png",
                                    "alt" => "banner",
                                ]
                            ],

                            [
                                "type" => "file",
                                "property" => [
                                    "name" => "file3",
                                    "label" => "身分証明書　表面",
                                    "field_label" => "身分証明書　表面",
                                    "value" => "",
                                    "pattern" => ""
                                ],
                            ],

                        ],
                        "response" => [
                            [
                                "text" => ["{1}</br>身分証明書　表面",],
                                "format" =>  ["uploading"]
                            ]
                        ]

                    ],
                    [
                        "prompt" => ["最後に換⾦ご案内のお電話のご連絡希望時間帯を教えてください"],
                        "formControl" => [
                            [
                                "type" => "select",
                                "property" => [
                                    "name" => "time",
                                    "label" => "ご連絡希望時間帯",
                                    "field_label" => "希望時間帯",
                                    "value" => "",
                                    "option" => [
                                        ["label" => "いつでも",  "value" => 1],
                                        ["label" => "9:00-10:00",  "value" => 2],
                                        ["label" => "10:00-11:00",  "value" => 3],
                                        ["label" => "11:00-12:00",  "value" => 4],
                                        ["label" => "12:00-13:00",  "value" => 5],
                                        ["label" => "13:00-14:00",  "value" => 6],
                                        ["label" => "14:00-15:00",  "value" => 7],
                                        ["label" => "15:00-16:00",  "value" => 8],
                                        ["label" => "16:00-17:00",  "value" => 9],
                                        ["label" => "17:00-18:00",  "value" => 10],
                                        ["label" => "18:00-19:00",  "value" => 11],
                                        ["label" => "19:00-20:00",  "value" => 12],
                                    ],
                                ],
                                "rule" => [
                                    "accept" => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                                    "error" => [
                                        "type" => "none",
                                        "message" => [
                                            "none"
                                        ]
                                    ]
                                ]
                            ],
                        ],
                        "response" => [
                            [
                                "text" => ["{0}ですね！ありがとうございます。"],
                                "format" =>  ["text"]
                            ]
                        ]
                    ],

                ];
