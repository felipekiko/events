pokemons_name = ('ekans', 'arbok')
pokemons_attack = (60, 85)
pokemons_defense = (44, 69)

def sum_pokemon_status(name, attack, defense):
    sum_stats = attack + defense
    return f'{name} tem status de {sum_stats}'

stats = map(
    sum_pokemon_status,
    pokemons_name, pokemons_attack, pokemons_defense
)

print(stats)

# HOW TO SEE? QUIZ TIME!
# print(list(stats))
