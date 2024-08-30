import json
import boto3

bedrock = boto3.client(
    service_name='bedrock-runtime', 
    region_name='us-east-1'
)

def lambda_handler(event, context):
    prompt = json.loads(event.get('body')).get('prompt')

    body = json.dumps({
        "prompt": f"[INST]{prompt}[/INST]", 
        "max_tokens": 400,
        "temperature": 0.7,
        "top_p": 0.7,
        "top_k": 50
    })
    
    response = bedrock.invoke_model(
        body=body, 
        modelId='mistral.mistral-small-2402-v1:0', 
        accept='application/json', 
        contentType='application/json'
    )

    response_body = json.loads(response.get('body').read())
    answer = response_body.get('outputs')[0].get('text')

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps({ "answer": answer })
    }
