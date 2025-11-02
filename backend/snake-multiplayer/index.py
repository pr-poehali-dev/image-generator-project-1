'''
Business: WebSocket server for multiplayer snake game
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response for connection management and game state updates
'''

import json
import time
import random
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict

GRID_SIZE = 40
SAFE_MARGIN = 2

@dataclass
class Position:
    x: int
    y: int

@dataclass
class Player:
    id: str
    snake: List[Position]
    direction: str
    score: int
    color: str
    alive: bool

game_state: Dict[str, Any] = {
    'players': {},
    'food': None,
    'candies': [],
    'started': False,
    'last_update': time.time()
}

COLORS = ['#F97316', '#8B5CF6', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899']

def generate_random_position() -> Position:
    return Position(
        x=random.randint(0, GRID_SIZE - 1),
        y=random.randint(0, GRID_SIZE - 1)
    )

def wrap_position(pos: Position) -> Position:
    return Position(
        x=pos.x % GRID_SIZE,
        y=pos.y % GRID_SIZE
    )

def check_collision_with_players(head: Position, player_id: str) -> bool:
    for pid, player in game_state['players'].items():
        if not player.alive:
            continue
        for segment in player.snake:
            if head.x == segment.x and head.y == segment.y:
                if pid != player_id:
                    return True
                if pid == player_id and segment != player.snake[0]:
                    return True
    return False

def move_snake(player: Player) -> bool:
    head = player.snake[0]
    
    dx, dy = 0, 0
    if player.direction == 'UP':
        dy = -1
    elif player.direction == 'DOWN':
        dy = 1
    elif player.direction == 'LEFT':
        dx = -1
    elif player.direction == 'RIGHT':
        dx = 1
    
    new_head = wrap_position(Position(head.x + dx, head.y + dy))
    
    if check_collision_with_players(new_head, player.id):
        player.alive = False
        return False
    
    player.snake.insert(0, new_head)
    
    if game_state['food'] and new_head.x == game_state['food'].x and new_head.y == game_state['food'].y:
        player.score += 10
        game_state['food'] = generate_random_position()
    else:
        player.snake.pop()
    
    return True

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Player-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'join':
            player_id = body.get('playerId')
            
            if player_id not in game_state['players']:
                color = COLORS[len(game_state['players']) % len(COLORS)]
                start_pos = generate_random_position()
                
                game_state['players'][player_id] = Player(
                    id=player_id,
                    snake=[start_pos],
                    direction='RIGHT',
                    score=0,
                    color=color,
                    alive=True
                )
                
                if not game_state['food']:
                    game_state['food'] = generate_random_position()
                
                if len(game_state['players']) >= 2 and not game_state['started']:
                    game_state['started'] = True
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'playerId': player_id,
                    'color': game_state['players'][player_id].color,
                    'waiting': len(game_state['players']) < 2
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'move':
            player_id = body.get('playerId')
            direction = body.get('direction')
            
            if player_id in game_state['players']:
                player = game_state['players'][player_id]
                
                opposites = {
                    'UP': 'DOWN', 'DOWN': 'UP',
                    'LEFT': 'RIGHT', 'RIGHT': 'LEFT'
                }
                
                if direction != opposites.get(player.direction):
                    player.direction = direction
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'leave':
            player_id = body.get('playerId')
            if player_id in game_state['players']:
                del game_state['players'][player_id]
            
            if len(game_state['players']) < 2:
                game_state['started'] = False
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
    
    if method == 'GET':
        current_time = time.time()
        
        if game_state['started'] and current_time - game_state['last_update'] > 0.15:
            for player in game_state['players'].values():
                if player.alive:
                    move_snake(player)
            game_state['last_update'] = current_time
        
        players_data = []
        for player in game_state['players'].values():
            players_data.append({
                'id': player.id,
                'snake': [{'x': p.x, 'y': p.y} for p in player.snake],
                'direction': player.direction,
                'score': player.score,
                'color': player.color,
                'alive': player.alive
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'players': players_data,
                'food': {'x': game_state['food'].x, 'y': game_state['food'].y} if game_state['food'] else None,
                'started': game_state['started'],
                'gridSize': GRID_SIZE
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }