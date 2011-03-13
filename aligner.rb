require 'rubygems'
require 'sinatra'
require 'sinatra/content_for'
require 'erb'
require 'json'

class Sprite
  attr_accessor :w, :h, :pos
  
  def initialize(width, height)
    super()
    @w = width
    @h = height
    @pos = { :x => 0, :y => 0 }
  end
  
  def dump
  end
  
  def to_json
    { :w => @w, :h => @h, :x => @pos[:x], :y => @pos[:y] }.to_json
  end
  
  def space
    @pos[:x] + @w    
  end
  
end

class Canvas

  BELOW = 0
  ABOVE = 1
  RIGHT = 2
  LEFT = 3
  
  def initialize
    super()
    @sprites = []
  end
  
  def empty_at(pivot, sprites, dir)
    case dir
    when BELOW
      sprites.each { |sprite| return false if sprite.pos[:x] == pivot.pos[:x] && sprite != pivot }
      true
    end
  end
  
  def find_pos_below(pivot, sprites, target)
    # we have to find all the sprites that are within the range of pivot.pos.x and pivot.pos.x + pivot.w
    sprites_below = []
    sprites.each { |sprite| 
      next if sprite == pivot
      pivot_space = pivot.pos[:x]..(pivot.pos[:x]+pivot.w)
      puts pivot_space
      if sprite.pos[:x] == pivot.pos[:x] || pivot_space.include?(sprite.pos[:x])
        sprites_below << sprite
      end
    }
    
    sum_w = 0
    offset = 0
    sprites_below.each { |sprite| 
      sum_w += sprite.w unless sprite == target
      offset = sum_w + (pivot.pos[:x] - sprite.pos[:x])
    }
    if pivot.w - sum_w >= target.w
      puts "found a match"
      
      return { :x => sum_w + pivot.pos[:x], :y => pivot.pos[:y] + pivot.h }
    else
      return false
    end
  end
  
  def align
    aligned = []
    unaligned = Array.new(@sprites)
    # determine bounds
    highest, longest = nil
    @sprites.each { |sprite| 
      highest = sprite if !highest or highest.h < sprite.h
      longest = sprite if !longest or longest.w < sprite.w
    }
    
    # the first sprite will be the highest, the second the longest
    aligned << highest << longest
    unaligned.delete(highest)
    unaligned.delete(longest)
    
    # sort the remaining by height desc (largest first)
    until unaligned.empty? do
      largest = nil
      unaligned.each { |sprite| largest = sprite if !largest or largest.h < sprite.h }
      unless largest.nil?
        aligned << largest
        unaligned.delete(largest)
      end
    end
    
    # spread them horizontally
    offset = { :x => 0, :y => 0 }
    aligned.each_with_index { |sprite, idx|
      offset[:x] += aligned[idx-1].w unless idx == 0
      sprite.pos[:x] = offset[:x]
    }
    
    # now to realign sprites in a more compact manner
    # * if the current sprite's width is less or equal to previous
    # => sprite's width, AND the total of their heights combined does
    # => not exceed the boundary, then they can be aligned below each other
    aligned.each_with_index { |sprite, idx|
      next if idx < 1 # we start from the 3rd sprite
      pos = nil
      aligned[1..idx].each_with_index { |last_sprite, pidx|
        pos = find_pos_below(last_sprite, aligned, sprite)
        break if pos != false
      }
      
      sprite.pos = pos unless pos == false
=begin
        if sprite.w <= last_sprite.w && sprite.h + last_sprite.h <= aligned.first.h
          next if last_sprite == sprite

          
          # make sure there's no other sprite at that position
          if empty_at(last_sprite, aligned, BELOW)
            last_pos = sprite.pos
            
            sprite.pos[:x] = last_sprite.pos[:x]
            sprite.pos[:y] = last_sprite.pos[:y] + last_sprite.h
            # now we have to pad all the remaining sprites to the right of us to the left
            unless idx == aligned.length
              aligned[idx+1..aligned.length].each { |next_sprite| 
                next_sprite.pos[:x] -= sprite.w if next_sprite.pos[:x] > last_pos[:x]
              }
            end
          end
        end      
      }
=end
      #last_sprite = aligned[idx-1]
    }
    @sprites = aligned
  end
  
  def dump
    puts self.to_json
  end

  def add_sprite(sprite)
    @sprites << sprite
  end
  
  def to_json
    json = []
    @sprites.each { |sprite| json << sprite.to_json }
    json.to_json
  end
  
end

def populate
  sprites = [
    Sprite.new(20, 20),
    Sprite.new(60, 20),
    Sprite.new(10, 80),
    Sprite.new(35, 15),
    Sprite.new(60, 40),
    Sprite.new(20, 80),
    Sprite.new(90, 50),
    Sprite.new(40, 140)        
  ].each { |sprite| @canvas.add_sprite(sprite) }
end

get '/' do
  erb :"index"
end