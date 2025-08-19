# config/importmap.rb
pin "application"

# Hotwire / Stimulus
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"

# Autoload all controllers under app/javascript/controllers
pin_all_from "app/javascript/controllers", under: "controllers"