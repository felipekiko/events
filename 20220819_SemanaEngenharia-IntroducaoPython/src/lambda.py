which_pokemon = lambda name, attack : f"{name} tem {attack} de ataque"
print(which_pokemon('ekans', 60))
print(which_pokemon('arbok', 85))

sum_base_status = lambda hp, attack, defense : (hp + defense) - attack
print('ekans tem status de ' + str(sum_base_status(35, 60, 44)))
print('arbok tem status de ' + str(sum_base_status(60, 85, 69)))
