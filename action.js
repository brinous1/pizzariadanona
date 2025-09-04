// --- LÓGICA DO CARRINHO DE COMPRAS ---

const deliveryFee = 7.00; // Taxa de frete fixa
// IMPORTANTE: Substitua o número abaixo pelo WhatsApp da sua pizzaria, com o código do país
const numeroWhatsApp = '5541932182598'; 

// Função para adicionar um item ao carrinho
function addToCart(pizzaName, price) {
    // 1. Pega o carrinho atual do localStorage ou cria um array vazio
    let cart = JSON.parse(localStorage.getItem('pizzariaCart')) || [];

    // 2. Verifica se a pizza já está no carrinho
    const existingItem = cart.find(item => item.name === pizzaName);

    if (existingItem) {
        // Se já existe, apenas aumenta a quantidade
        existingItem.quantity++;
    } else {
        // Se não existe, adiciona o novo item
        cart.push({ name: pizzaName, price: price, quantity: 1 });
    }
    
    // 3. Salva o carrinho atualizado de volta no local Storage
    localStorage.setItem('pizzariaCart', JSON.stringify(cart));
    
    // 4. Avisa o usuário que o item foi adicionado
    alert(`${pizzaName} foi adicionado ao seu carrinho!`);
}

// Função para exibir o carrinho na página de pedidos
function displayCart() {
    const cartItemsElement = document.getElementById('cart-items');
    // Se não encontrar o elemento do carrinho, encerra a função (estamos em outra página)
    if (!cartItemsElement) {
        return;
    }

    const subtotalElement = document.getElementById('subtotal');
    const freteElement = document.getElementById('frete');
    const totalElement = document.getElementById('total');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    // Pega o carrinho do localStorage
    const cart = JSON.parse(localStorage.getItem('pizzariaCart')) || [];

    // Limpa o conteúdo atual do carrinho
    cartItemsElement.innerHTML = '';

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'list-item'; // Garante que a mensagem apareça
        subtotalElement.textContent = 'R$ 0,00';
        freteElement.textContent = 'R$ 0,00';
        totalElement.textContent = 'R$ 0,00';
        return;
    }
    
    emptyCartMessage.style.display = 'none'; // Esconde a mensagem se houver itens

    let subtotal = 0;

    cart.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`;
        cartItemsElement.appendChild(listItem);
        subtotal += item.price * item.quantity;
    });

    const total = subtotal + deliveryFee;

    // Atualiza os valores na tela
    subtotalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
    freteElement.textContent = `R$ ${deliveryFee.toFixed(2)}`;
    totalElement.textContent = `R$ ${total.toFixed(2)}`;
}

// Função para finalizar o pedido e enviar via WhatsApp
function finalizeOrder(event) {
    // 1. Previne o comportamento padrão do formulário (que é recarregar a página)
    event.preventDefault();

    // 2. Pega os dados do carrinho e do formulário
    const cart = JSON.parse(localStorage.getItem('pizzariaCart')) || [];
    const nome = document.getElementById('nome-pedido').value;
    const endereco = document.getElementById('endereco-pedido').value;

    // 3. Verifica se o carrinho não está vazio e se os campos foram preenchidos
    if (cart.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    if (!nome || !endereco) {
        alert("Por favor, preencha seu nome e endereço para finalizar o pedido.");
        return;
    }

    // 4. Monta a mensagem do pedido
    let message = `*--- Novo Pedido Pizzaria da Nona ---*\n\n`;
    message += `*Cliente:* ${nome}\n`;
    message += `*Endereço de Entrega:* ${endereco}\n\n`;
    message += `*Itens do Pedido:*\n`;

    let subtotal = 0;
    cart.forEach(item => {
        message += `- ${item.quantity}x ${item.name} (R$ ${(item.price * item.quantity).toFixed(2)})\n`;
        subtotal += item.price * item.quantity;
    });

    const total = subtotal + deliveryFee;

    message += `\n*Subtotal:* R$ ${subtotal.toFixed(2)}\n`;
    message += `*Taxa de Entrega:* R$ ${deliveryFee.toFixed(2)}\n`;
    message += `*Total a Pagar:* R$ ${total.toFixed(2)}\n`;

    // 5. Codifica a mensagem para URL e cria o link do WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${numeroWhatsApp}?text=${encodedMessage}`;

    // 6. Abre o link do WhatsApp em uma nova aba e limpa o carrinho
    window.open(whatsappUrl, '_blank');
    
    localStorage.removeItem('pizzariaCart');
    displayCart(); // Atualiza a exibição para mostrar o carrinho vazio
}

// Adiciona os 'escutadores' de eventos quando o documento é carregado
document.addEventListener('DOMContentLoaded', () => {
    // Roda a função para exibir o carrinho (caso estejamos na página de pedidos)
    displayCart();

    // Adiciona o listener para o formulário de pedido
    const orderForm = document.querySelector('#pedidos form');
    if (orderForm) {
        orderForm.addEventListener('submit', finalizeOrder);
    }
});