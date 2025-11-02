'''
Business: Snake game shop API for managing skins and player coins
Args: event with httpMethod, body; context with request_id
Returns: Shop data, purchase results, player inventory
'''

import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_player_data(player_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "SELECT player_id, coins, total_score, games_played FROM snake_players WHERE player_id = %s",
        (player_id,)
    )
    player = cur.fetchone()
    
    if not player:
        cur.execute(
            "INSERT INTO snake_players (player_id, coins) VALUES (%s, 0) RETURNING player_id, coins, total_score, games_played",
            (player_id,)
        )
        conn.commit()
        player = cur.fetchone()
    
    cur.execute(
        """SELECT skin_id FROM snake_player_skins WHERE player_id = %s""",
        (player_id,)
    )
    owned_skins = [row['skin_id'] for row in cur.fetchall()]
    
    cur.execute(
        """SELECT skin_id FROM snake_active_skins WHERE player_id = %s""",
        (player_id,)
    )
    active_row = cur.fetchone()
    active_skin = active_row['skin_id'] if active_row else 1
    
    cur.close()
    conn.close()
    
    return {
        'player_id': player['player_id'],
        'coins': player['coins'],
        'total_score': player['total_score'],
        'games_played': player['games_played'],
        'owned_skins': owned_skins,
        'active_skin': active_skin
    }

def get_all_skins() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT id, name, description, price, head_color, body_color, emoji, is_premium FROM snake_skins ORDER BY price ASC")
    rows = cur.fetchall()
    
    cur.close()
    conn.close()
    
    skins = []
    for row in rows:
        skins.append({
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'price': row[3],
            'head_color': row[4],
            'body_color': row[5],
            'emoji': row[6],
            'is_premium': row[7]
        })
    
    return skins

def purchase_skin(player_id: str, skin_id: int) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT * FROM snake_skins WHERE id = %s", (skin_id,))
    skin = cur.fetchone()
    
    if not skin:
        cur.close()
        conn.close()
        return {'success': False, 'error': 'Скин не найден'}
    
    cur.execute(
        "SELECT * FROM snake_player_skins WHERE player_id = %s AND skin_id = %s",
        (player_id, skin_id)
    )
    if cur.fetchone():
        cur.close()
        conn.close()
        return {'success': False, 'error': 'Скин уже куплен'}
    
    cur.execute("SELECT coins FROM snake_players WHERE player_id = %s", (player_id,))
    player = cur.fetchone()
    
    if not player or player['coins'] < skin['price']:
        cur.close()
        conn.close()
        return {'success': False, 'error': 'Недостаточно монет'}
    
    cur.execute(
        "UPDATE snake_players SET coins = coins - %s WHERE player_id = %s",
        (skin['price'], player_id)
    )
    
    cur.execute(
        "INSERT INTO snake_player_skins (player_id, skin_id) VALUES (%s, %s)",
        (player_id, skin_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {'success': True, 'skin_id': skin_id}

def activate_skin(player_id: str, skin_id: int) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        "SELECT * FROM snake_player_skins WHERE player_id = %s AND skin_id = %s",
        (player_id, skin_id)
    )
    
    if not cur.fetchone():
        cur.close()
        conn.close()
        return {'success': False, 'error': 'Скин не куплен'}
    
    cur.execute(
        "DELETE FROM snake_active_skins WHERE player_id = %s",
        (player_id,)
    )
    
    cur.execute(
        "INSERT INTO snake_active_skins (player_id, skin_id) VALUES (%s, %s)",
        (player_id, skin_id)
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {'success': True, 'skin_id': skin_id}

def add_coins(player_id: str, amount: int, score: int) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(
        """UPDATE snake_players 
           SET coins = coins + %s, 
               total_score = total_score + %s,
               games_played = games_played + 1
           WHERE player_id = %s
           RETURNING coins""",
        (amount, score, player_id)
    )
    
    result = cur.fetchone()
    if not result:
        cur.execute(
            """INSERT INTO snake_players (player_id, coins, total_score, games_played) 
               VALUES (%s, %s, %s, 1) RETURNING coins""",
            (player_id, amount, score)
        )
        result = cur.fetchone()
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {'success': True, 'coins': result['coins']}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        player_id = params.get('playerId')
        
        skins = get_all_skins()
        
        if player_id:
            player_data = get_player_data(player_id)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'skins': skins,
                    'player': player_data
                }),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'skins': skins}),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        player_id = body.get('playerId')
        
        if action == 'purchase':
            skin_id = body.get('skinId')
            result = purchase_skin(player_id, skin_id)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif action == 'activate':
            skin_id = body.get('skinId')
            result = activate_skin(player_id, skin_id)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif action == 'addCoins':
            amount = body.get('amount', 0)
            score = body.get('score', 0)
            result = add_coins(player_id, amount, score)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }