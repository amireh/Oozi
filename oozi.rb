require 'rubygems'
require 'sinatra'
require 'sinatra/content_for'
require 'erb'

get '/' do
  erb :"index"
end