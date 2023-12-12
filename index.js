var AWS = require('aws-sdk');
const uuid = require('uuid');
var ddb = new AWS.DynamoDB.DocumentClient();

const check_empty_fields = (event) => {
  let checkEmptyFields = true;
  for (const field in event) {
    if (typeof event[field] == 'string') {
      if (event[field].trim().length == 0) {
        checkEmptyFields = false;
      }
      else {
        event[field] = event[field].trim();
      }
    }
  }
  return checkEmptyFields;
};

//DYNAMO
const insert_into_dynamo = async (params) => {
  try {
    await ddb.put(params).promise();
    return "success";
  }
  catch (err) {
    console.log(params, err);
    throw new Error(err);
  }
};

const book_vehicle = async (event) => {
  if (check_empty_fields(event)) {
    if (event.number_of_wheels == 2 || event.number_of_wheels == 4) {
      let insertUserDetailsParams = {
        TableName: "booked_users",
        Item: {
          booking_id: uuid.v4(),
          user_first_name: event.user_first_name,
          user_last_name: event.user_last_name,
          user_full_name: event.user_first_name + " " + event.user_last_name,
          number_of_wheels: event.number_of_wheels,
          type_of_vehicle: event.type_of_vehicle,
          vehicle_number: event.vehicle_number,
          Model_name: event.Model_name,
          user_status: "ACTIVE",
          booking_status: "Booked",
          user_created_on: new Date().getTime(),
          vehicle_rent_start_date: event.vehicle_rent_start_date,
          vehicle_rent_end_date: event.vehicle_rent_end_date
        },
      };
      let user = await insert_into_dynamo(insertUserDetailsParams);
      if (user == 'success') {
        return {
          status: "SUCCESS",
          status_message: "Your Vehicle " + event.Model_name + " is booked successfully!"
        };
      }
      else {
        throw new Error('Vehicle not Booked! try again!');
      }
    }
    else {
      throw new Error("The number of wheels will be either be 2 or 4");
    }
  }
  else {
    throw new Error('Empty Field Occured User Can not SignUp!');
  }
};

exports.handler = async (event) => {
  console.log(JSON.stringify(event));
  switch (event.command) {
    case 'BookVehicles':
      return await book_vehicle(event);
    default:
      throw new Error("command not Found!");
  }
};