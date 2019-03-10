import re

RE_EMOJI = re.compile("["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
        u"\U00010000-\U0010ffff"  # any others
                           "]+", flags=re.UNICODE)
def strip_emoji(text):
    return RE_EMOJI.sub(r'', text)

file = open("crushbridge_data.txt","r")
data = file.read()

file.close()

new_data = data.split("\n\n")

print(new_data)
file = open("crushbridge_true_data.txt","w+")

for i in new_data:
    if not((i[-7:] == "See more") or (i[-3:] == "...")):
        file.write(strip_emoji(i))
        file.write("\n")
        file.write("%")
        file.write("\n")

file.close()
