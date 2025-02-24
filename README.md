# chatbot-js

Sample config form
[
{
prompt: ["Thank you for choosing! ABC Company", "Now how can i help you?"],
formControl: []
},
{
prompt: ["This is our services to offer", "Please choose one to proceed"],
formTitle: [],
formControl: [{
type: "button-group",
property: {
name: "services",
value: "",
label: "Services",
field_label: "Service choosed",
option: [{
label: "Web Development",
value: 1
},
{
label: "Mobile Developent",
value: 2
},
{
label: "SEO",
value: 3
},
],
},
rule: {
accept: [1, 3],
error: {
type: "info",
message: [
"This service is not available right now."
]
}
}
}, ],
response: [{
text: ["Thank you for choosing this services! {0}"],
format: ["text"]
}, ]
},
{
prompt: ["What is gender?"],
formTitle: [],
formControl: [{
type: "button-group",
property: {
name: "gender",
value: "",
label: "Gender",
field_label: "Gender",
option: [{
label: "Male",
value: 'male'
},
{
label: "Female",
value: 'female'
},
],
},
rule: {
accept: ['male', 'female'],
error: {
type: "list",
message: [
"This gender is not available"
]
}
}
}, ],
response: [{
text: ["Your gender is {0}"],
format: ["text"]
}, ]
},
{
prompt: ["Let me know your identity", "Can i have your name"],
formControl: [{
type: "text",
property: {
name: "firstname",
label: "Firstname",
field_label: "Firstname",
value: "",
placeholder: ""
}
},
{
type: "text",
property: {
name: "lastname",
label: "Lastname",
field_label: "Lastname",
value: "",
placeholder: "",
}
}
],
response: [{
text: ["Thank you! {0}{1}"],
format: ["text"]
}]
},
];
