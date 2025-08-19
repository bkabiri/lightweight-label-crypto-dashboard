# config/routes.rb
Rails.application.routes.draw do
  devise_for :users

  # Signed-in users land on dashboard
  authenticated :user do
    root to: "home#index", as: :authenticated_root
  end

  # Everyone else sees the landing page
  root to: "home#landing"
  resources :wallets, only: [:create]

  # Health/PWA (keep your existing ones)
  get "up" => "rails/health#show", as: :rails_health_check
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
end