import random
import string


def generate_username():
    adjectives = [
        "swift",
        "silent",
        "brave",
        "clever",
        "witty",
        "nimble",
        "mighty",
        "fierce",
        "jolly",
        "breezy",
        "chill",
        "wild",
        "quirky",
        "lazy",
        "zesty",
        "epic",
        "cosmic",
        "bold",
        "sassy",
        "cheerful",
        "daring",
        "loyal",
        "vivid",
        "stormy",
        "zany",
        "snappy",
        "nimble",
        "graceful",
        "cunning",
        "fearless",
        "glowing",
        "serene",
        "playful",
        "spirited",
        "roaring",
        "timeless",
        "bubbly",
        "cheeky",
        "gentle",
        "radiant",
        "whimsical",
        "feisty",
        "frosty",
        "gritty",
        "stellar",
        "heroic",
        "mystic",
        "dashing",
        "glorious",
        "sturdy",
        "proud",
        "courageous",
        "wily",
        "sly",
        "lively",
        "sparkly",
        "frosty",
        "gleaming",
        "jovial",
        "vibrant",
        "gleeful",
        "quirky",
        "sunny",
        "tenacious",
        "valiant",
        "zippy",
        "zesty",
        "zippy",
        "fancy",
        "bouncy",
        "hasty",
        "glittering",
        "dreamy",
        "tidy",
        "chirpy",
        "fiery",
        "rusty",
        "peppy",
        "sneaky",
        "perky",
        "silly",
    ]
    nouns = [
        "panda",
        "hawk",
        "fox",
        "tiger",
        "bear",
        "wolf",
        "otter",
        "falcon",
        "llama",
        "turtle",
        "cobra",
        "moose",
        "dragon",
        "unicorn",
        "phoenix",
        "raven",
        "lynx",
        "panther",
        "eagle",
        "ferret",
        "coyote",
        "badger",
        "giraffe",
        "wolverine",
        "hedgehog",
        "mongoose",
        "cheetah",
        "leopard",
        "owl",
        "parrot",
        "swan",
        "chameleon",
        "dolphin",
        "orca",
        "shark",
        "stingray",
        "lobster",
        "crab",
        "flamingo",
        "penguin",
        "jaguar",
        "cougar",
        "zebra",
        "rhino",
        "elk",
        "antelope",
        "gazelle",
        "bat",
        "toad",
        "frog",
        "gecko",
        "iguana",
        "python",
        "viper",
        "macaw",
        "tamarin",
        "lemur",
        "koala",
        "kangaroo",
        "platypus",
        "octopus",
        "seal",
        "narwhal",
        "walrus",
        "peacock",
        "sparrow",
        "finch",
        "beetle",
        "butterfly",
        "moth",
        "lynx",
        "mongoose",
        "fox",
        "puffin",
        "weasel",
        "wombat",
        "pelican",
        "orca",
        "stingray",
        "jellyfish",
        "squid",
        "sloth",
        "armadillo",
        "tapir",
        "okapi",
        "hyena",
        "aardvark",
        "quokka",
        "manatee",
        "beaver",
        "chipmunk",
        "meerkat",
        "tamarin",
        "toucan",
        "kangaroo",
        "albatross",
    ]

    # Generate a random combination
    adjective = random.choice(adjectives)
    noun = random.choice(nouns)
    number = "".join(random.choices(string.digits, k=4))

    # Combine them to form a username
    username = f"{adjective}{noun}{number}"
    return username
