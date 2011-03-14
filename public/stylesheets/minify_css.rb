#!/usr/bin/env ruby

require 'fileutils'
output = 'application.min.css'
`rm #{output}`
Dir["*.css"].each { |file| `yui --type css #{file} >> #{output}` }
puts "minified to #{output}"
