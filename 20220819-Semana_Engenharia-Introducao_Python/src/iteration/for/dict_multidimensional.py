pokemons = {
    'pikachu': {
        'type': 'electric',
        'weakness': 'water'
    },
    'eevee': {
        'type': 'normal',
        'weakness': 'fighting'
    },
    'charmander': {
        'type': 'fire',
        'weakness': 'grass'
    },
    'squirtle': {
        'type': 'water',
        'weakness': 'electric'
    },
    'bulbasaur': {
        'type': 'grass',
        'weakness': 'fire'
    }
}

for pokemon, attributes in pokemons.items():
    print(f"Pokemon: {pokemon}")
    print(f"- Tipo: {attributes['type']}")
    print(f"- Fraqueza: {attributes['weakness']}")
    print()
