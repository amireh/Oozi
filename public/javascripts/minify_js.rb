#!/usr/bin/env ruby

require 'fileutils'

def print_stats(output, original_size)
	size = { 
		:output => File.size?(output) / 1024,
		:original => original_size / 1024
	}
	ratio = 100 - (File.size?(output).to_i / original_size.to_i * 100)
	puts "----"
	puts "minified from #{size[:original]}Kb; to #{size[:output]}Kb (#{ratio}% size reduction)"
end

output = ""
for i in 0..1 do
	size = 0;
	if i == 0
		output = "application.min.js"
	else
		output = "oozi.min.js"
		Dir.chdir("oozi")
	end
	puts "minifying #{output}"
	`rm #{output}`
	Dir["*.js"].each { |file| size += File.size?(file); puts "minifying #{file} (#{File.size?(file)/1024}Kb)"; `yui --type js #{file} >> #{output}`; }
	print_stats(output, size)
end

