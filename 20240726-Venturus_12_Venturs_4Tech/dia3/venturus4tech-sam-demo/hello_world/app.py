import json

def lambda_handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Hello Venturus 4Tech...from your friendly neighborhood KiKo!"
        }),
    }
