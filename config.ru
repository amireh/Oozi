require 'rubygems'
require 'sinatra'

#Sinatra::Base.set(:environment, :production)
Sinatra::Base.set(:run, false)

require 'oozi'
run Sinatra::Application
