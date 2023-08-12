# Pauly
Pauly is a hub for all things school related.
# Backend
Pauly uses microsoft graph and uses sharepoint lists as a data base
## Structure 
### Calendar
Calendar is organized into documents of years containing collections of months. These months are formated as a number based on January being 1. Inside each collection documents of days are inside. Each day contains the day, month and year. As well as the school day and schedule id. If the schedule does not have a value it is schedule one (default schedule).
### Commissions
Commissions are organized into documents that are named with there commission id. In each document their is a
1. Start date
2. End date
3. Hidden
4. Points (what the commission is worth)
5. Selected Page (which page is shown)
6. Value (the type of commission it is)
      1. Approved by issuer
      2. Location
      3. Image
      4. Image and Location
      5. QR Code


## Setup
Pauly has a config file named PaulyConfig which contains threee values 
      1. Site Id
      2. Org Id (This is the value of the teams site which will be used for the calendar)
      3. Site List Id (This value can be found by pauly and doesn't need to be set)

### extentions
Extensions
{
    "id": "paulyEvents",
    "description": "Pauly Event Data",
    "targetTypes": [
        "Event"
    ],
    "owner": "08624b03-1aa6-40c4-8fb3-149c39026dff", <- application id
    "properties": [
        {
            "name": "eventType",
            "type": "String"
        },
        {
            "name": "eventData",
            "type": "String"
        }
    ]
}
