import BTEdb, urllib.request, json, sys, os, subprocess
null = open(os.devnull, "w")
db = BTEdb.Database("lm2.json")
init = False
def s(k):
	return "" if k == 1 else "s"
if not db.TableExists("main"):
	init = True
	db.CreateTable("main")
def get(board):
	res = []
	parsed = json.loads(urllib.request.urlopen("https://lainchan.org/" + board + "/catalog.json").read())
	for page in parsed:
		for r in page["threads"]:
			r["board"] = board
			r["key"] = board + ":" + str(r["no"])
			res.append(r)
	return res
def replace(board):
	if board == "tech": return "Ω"
	if board == "lambda": return "λ"
	return board
threads = []
threads += get("tech")
threads += get("lambda")
threads += get("sec")
for thread in threads:
	last = db.Select("main", key = thread["key"])
	exists = len(last) != 0
	last = last[0]["value"] if exists else -1
	thread["new"] = thread["replies"] - last
	thread["exists"] = exists
	if init and not exists:
		db.Insert("main", key = thread["key"], value = thread["replies"])
if init:
	print("First time setup completed. Exiting")
	sys.exit(0)
threads = [t for t in threads if t["new"] != 0]
threads.sort(key = lambda t: t["new"])
if len(threads) == 0:
	print("No threads")
	sys.exit(0)
end = max([t["new"] for t in threads])
for i in range(1, end + 1):
	this_round = [t for t in threads if t["new"] == i]
	if len(this_round) == 0: continue
	input(str(len(this_round)) + " thread" + s(len(this_round)) + " with " + str(i) + " new replies, enter to open: ")
	for t in this_round:
		subprocess.call(
				["xdg-open", "https://lainchan.org/mod.php?/" + replace(t["board"]) + "/res/" + str(t["no"]) + ".html#" + str(t["new"])],
				stdout = null,
				stderr = null
				)
		if t["exists"]:
			db.Update("main", db.Select("main", key = t["key"]), value = t["replies"])
		else:
			db.Insert("main", key = t["key"], value = t["replies"])
