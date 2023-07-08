pokemons = ['pikachu', 'eevee', 'charmander', 'squirtle', 'bulbasaur']

pokemons_with_letter_e = []

for pokemon in pokemons:
  if "e" in pokemon:
    pokemons_with_letter_e.append(pokemon)

print(pokemons_with_letter_e)

# SIMPLE! QUIZ TIME!
# pokemons_with_letter_e = [x for x in pokemons if "e" in x]
# print(pokemons_with_letter_e)
