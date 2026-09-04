pokemons = {
    'pikachu': {
        'hp': 35,
        'attack': 55,
        'defense': 40
    },
    'ekans': {
        'hp': 35,
        'attack': 60,
        'defense': 40
    }
}

if pokemons['pikachu']['attack'] > pokemons['ekans']['attack']:
    print('Pikachu é mais forte')
elif pokemons['pikachu']['attack'] < pokemons['ekans']['attack']:
    print('Ekans é mais forte')
else:
    print('São iguais')

# SHORT HAND - QUIZ TIME!
# stronger_pokemon = "Pikachu" if pokemons['pikachu']['attack'] >= pokemons['ekans']['attack'] else "Ekans"
# print(f"{stronger_pokemon} é mais forte")
